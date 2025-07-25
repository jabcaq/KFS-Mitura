// Vercel Serverless Function for GUS API proxy
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Get NIP from query params (GET request) or body (POST request)
  const nip = req.query.nip || req.body?.nip

  if (!nip) {
    return res.status(400).json({
      success: false,
      error: 'NIP is required in query params or body'
    })
  }

  const GUS_CONFIG = {
    apiKey: process.env.GUS_API_KEY || 'd7982285-bceb-43a7-a44c-8f0140c235a3',
    baseUrl: 'https://wl-api.mf.gov.pl'
  }

  try {
    const url = `${GUS_CONFIG.baseUrl}/api/search/nip/${nip}?date=${new Date().toISOString().split('T')[0]}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GUS_CONFIG.apiKey}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({
        success: false,
        error: `GUS API error: ${response.status} - ${errorText}`
      })
    }

    const result = await response.json()
    
    res.status(200).json({
      success: true,
      data: result,
      source: 'GUS'
    })

  } catch (error) {
    console.error('GUS proxy error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    })
  }
}