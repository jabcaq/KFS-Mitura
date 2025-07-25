// Vercel Serverless Function for KAS API proxy
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

  try {
    const url = `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${new Date().toISOString().split('T')[0]}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({
        success: false,
        error: `KAS API error: ${response.status} - ${errorText}`
      })
    }

    const result = await response.json()
    
    res.status(200).json({
      success: true,
      data: result,
      source: 'KAS'
    })

  } catch (error) {
    console.error('KAS proxy error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    })
  }
}