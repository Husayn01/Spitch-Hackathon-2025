import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const endpoint = url.searchParams.get('endpoint') || ''
    
    const SPITCH_API_KEY = Deno.env.get('SPITCH_API_KEY')
    if (!SPITCH_API_KEY) {
      throw new Error('SPITCH_API_KEY not configured')
    }
    
    // Use the API URL - might need to be updated based on actual working domain
    const SPITCH_API_URL = 'https://api.spi-tch.com'
    
    console.log(`Proxying request to: ${SPITCH_API_URL}${endpoint}`)
    
    // Handle different endpoint types based on content type
    const contentType = req.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle multipart requests (transcriptions)
      const formData = await req.formData()
      
      const response = await fetch(`${SPITCH_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SPITCH_API_KEY}`,
        },
        body: formData,
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Spitch API error:', response.status, errorText)
        return new Response(JSON.stringify({ 
          error: `API Error: ${response.status}`,
          message: errorText 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        })
      }
      
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      })
    } else {
      // Handle JSON requests
      const body = await req.json()
      
      const response = await fetch(`${SPITCH_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SPITCH_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      // Check content type of response
      const responseContentType = response.headers.get('content-type')
      
      if (responseContentType?.includes('audio')) {
        // Handle audio response
        const audioData = await response.arrayBuffer()
        return new Response(audioData, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': responseContentType,
          },
          status: response.status,
        })
      } else {
        // Handle JSON/text response
        const responseText = await response.text()
        
        // Try to parse as JSON
        try {
          const data = JSON.parse(responseText)
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
          })
        } catch {
          // If not JSON, return as is
          return new Response(responseText, {
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
            status: response.status,
          })
        }
      }
    }
  } catch (error) {
    console.error('Spitch proxy error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})