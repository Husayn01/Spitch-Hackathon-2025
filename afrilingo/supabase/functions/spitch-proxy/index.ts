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
    
    console.log('Received request for endpoint:', endpoint)
    
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
    
    // Get API key from environment
    const SPITCH_API_KEY = Deno.env.get('SPITCH_API_KEY')
    console.log('SPITCH_API_KEY exists:', !!SPITCH_API_KEY)
    console.log('SPITCH_API_KEY length:', SPITCH_API_KEY?.length || 0)
    
    if (!SPITCH_API_KEY) {
      console.error('SPITCH_API_KEY not found in environment variables')
      return new Response(JSON.stringify({ 
        error: 'Configuration error',
        message: 'API key not configured. Please set SPITCH_API_KEY in Supabase Edge Function environment variables.',
        debug: {
          envVars: Object.keys(Deno.env.toObject()),
          hasKey: false
        }
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
    
    console.log('Authorization header set:', !!spitchHeaders['Authorization'])
    
    let requestBody: BodyInit | undefined
    const contentType = req.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle multipart requests (for transcriptions)
      requestBody = await req.formData()
      console.log('Processing multipart/form-data request')
    } else if (contentType?.includes('application/json')) {
      // Handle JSON requests
      const bodyText = await req.text()
      requestBody = bodyText
      spitchHeaders['Content-Type'] = 'application/json'
      console.log('Processing JSON request, body:', bodyText.substring(0, 100))
    }
    
    // Make request to Spitch API
    console.log('Making request to Spitch API...')
    const spitchResponse = await fetch(`${SPITCH_API_URL}${endpoint}`, {
      method: 'POST',
      headers: spitchHeaders,
      body: requestBody,
    })
    
    console.log('Spitch API response status:', spitchResponse.status)
    console.log('Spitch API response headers:', Object.fromEntries(spitchResponse.headers.entries()))
    
    // Handle error responses
    if (!spitchResponse.ok) {
      const errorText = await spitchResponse.text()
      console.error('Spitch API error response:', errorText)
      
      // Try to parse as JSON for better error messages
      try {
        const errorJson = JSON.parse(errorText)
        return new Response(JSON.stringify({ 
          error: `Spitch API Error`,
          status: spitchResponse.status,
          message: errorJson.message || errorJson.detail || errorText,
          details: errorJson,
          debug: {
            endpoint,
            authHeaderSent: !!spitchHeaders['Authorization'],
            apiKeyLength: SPITCH_API_KEY.length
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: spitchResponse.status,
        })
      } catch {
        return new Response(JSON.stringify({ 
          error: `Spitch API Error`,
          status: spitchResponse.status,
          message: errorText,
          debug: {
            endpoint,
            authHeaderSent: !!spitchHeaders['Authorization'],
            apiKeyLength: SPITCH_API_KEY.length
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: spitchResponse.status,
        })
      }
    }
    
    // Handle successful response based on content type
    const responseContentType = spitchResponse.headers.get('content-type')
    console.log('Response content type:', responseContentType)
    
    if (responseContentType?.includes('audio')) {
      // Handle audio response (for speech generation)
      const audioData = await spitchResponse.arrayBuffer()
      console.log('Returning audio response, size:', audioData.byteLength)
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
      console.log('Returning JSON response')
      return new Response(JSON.stringify(jsonData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      // Handle other response types
      const textData = await spitchResponse.text()
      console.log('Returning text response')
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
      details: error.toString(),
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})