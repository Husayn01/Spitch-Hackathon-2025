import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const endpoint = url.searchParams.get('endpoint') || ''
    
    // Validate endpoint
    const allowedEndpoints = ['/v1/speech', '/v1/transcriptions', '/v1/tone-mark', '/v1/translate']
    if (!allowedEndpoints.includes(endpoint)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid endpoint',
        message: `Endpoint must be one of: ${allowedEndpoints.join(', ')}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    const SPITCH_API_KEY = Deno.env.get('SPITCH_API_KEY')
    if (!SPITCH_API_KEY) {
      console.error('SPITCH_API_KEY not configured in environment')
      return new Response(JSON.stringify({ 
        error: 'Configuration error',
        message: 'API key not configured. Please set SPITCH_API_KEY in Supabase Edge Function settings.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
    
    const SPITCH_API_URL = 'https://api.spi-tch.com'
    
    console.log(`Proxying request to: ${SPITCH_API_URL}${endpoint}`)
    
    // Prepare headers for Spitch API
    const spitchHeaders: HeadersInit = {
      'Authorization': `Bearer ${SPITCH_API_KEY}`,
    }
    
    let requestBody: BodyInit | undefined
    const contentType = req.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle multipart requests (for transcriptions)
      requestBody = await req.formData()
    } else if (contentType?.includes('application/json')) {
      // Handle JSON requests
      requestBody = await req.text()
      spitchHeaders['Content-Type'] = 'application/json'
    }
    
    // Make request to Spitch API
    const spitchResponse = await fetch(`${SPITCH_API_URL}${endpoint}`, {
      method: 'POST',
      headers: spitchHeaders,
      body: requestBody,
    })
    
    console.log('Spitch API response status:', spitchResponse.status)
    
    // Handle error responses
    if (!spitchResponse.ok) {
      const errorText = await spitchResponse.text()
      console.error('Spitch API error:', spitchResponse.status, errorText)
      
      // Try to parse as JSON for better error messages
      try {
        const errorJson = JSON.parse(errorText)
        return new Response(JSON.stringify({ 
          error: `Spitch API Error`,
          status: spitchResponse.status,
          message: errorJson.message || errorJson.detail || errorText,
          details: errorJson
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: spitchResponse.status,
        })
      } catch {
        return new Response(JSON.stringify({ 
          error: `Spitch API Error`,
          status: spitchResponse.status,
          message: errorText 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: spitchResponse.status,
        })
      }
    }
    
    // Handle response based on content type
    const responseContentType = spitchResponse.headers.get('content-type')
    
    if (responseContentType?.includes('audio')) {
      // Handle audio response (for speech generation)
      const audioData = await spitchResponse.arrayBuffer()
      return new Response(audioData, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': responseContentType,
          'Content-Length': audioData.byteLength.toString(),
        },
        status: 200,
      })
    } else if (responseContentType?.includes('application/json')) {
      // Handle JSON response
      const jsonData = await spitchResponse.json()
      return new Response(JSON.stringify(jsonData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      // Handle other response types
      const textData = await spitchResponse.text()
      return new Response(textData, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': responseContentType || 'text/plain' 
        },
        status: 200,
      })
    }
    
  } catch (error) {
    console.error('Spitch proxy error:', error)
    return new Response(JSON.stringify({ 
      error: 'Proxy error',
      message: error.message,
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})