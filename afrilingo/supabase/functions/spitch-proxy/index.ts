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
    
    // Correct API domain
    const SPITCH_API_URL = 'https://api.spi-tch.com'
    
    console.log(`Proxying request to: ${SPITCH_API_URL}${endpoint}`)
    
    // Handle transcription endpoint (multipart/form-data)
    if (endpoint === '/v1/transcriptions') {
      const formData = await req.formData()
      
      // Forward the form data
      const response = await fetch(`${SPITCH_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SPITCH_API_KEY}`,
        },
        body: formData,
      })
      
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      })
    }
    
    // Handle speech synthesis endpoint
    if (endpoint === '/v1/speech') {
      const body = await req.json()
      
      const response = await fetch(`${SPITCH_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SPITCH_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      
      // Speech endpoint returns audio/wav
      if (response.headers.get('content-type')?.includes('audio')) {
        const audioData = await response.arrayBuffer()
        return new Response(audioData, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'audio/wav',
          },
          status: response.status,
        })
      }
      
      // Error response
      const errorData = await response.text()
      return new Response(errorData, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      })
    }
    
    // Handle other JSON endpoints (translate, etc)
    const body = await req.json()
    
    const response = await fetch(`${SPITCH_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SPITCH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })
    
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