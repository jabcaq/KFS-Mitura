// Vercel Serverless Function for Airtable proxy
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Log the request for debugging
  console.log('API Request:', {
    method: req.method,
    body: req.body,
    headers: req.headers
  })

  const { method, endpoint, data } = req.body

  if (!method || !endpoint) {
    return res.status(400).json({
      success: false,
      error: 'Missing method or endpoint in request body'
    })
  }

  const AIRTABLE_CONFIG = {
    pat: process.env.AIRTABLE_PAT || 'pat2GsVT2OUjyaYt7.9e3aa8dcd3e0a5f4ce7809c627f8bd9647f93475c823995490eacc0aa70eeeb3',
    baseId: process.env.AIRTABLE_BASE_ID || 'appglhQbUMO1xf7GO'
  }

  console.log('Airtable Config:', {
    baseId: AIRTABLE_CONFIG.baseId,
    hasToken: !!AIRTABLE_CONFIG.pat,
    tokenPrefix: AIRTABLE_CONFIG.pat?.substring(0, 8) + '...'
  })

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${endpoint}`
    console.log('Making request to:', url)
    
    const response = await fetch(url, {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    })

    console.log('Airtable response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return res.status(response.status).json({
        success: false,
        error: `Airtable API error: ${response.status} - ${errorText}`
      })
    }

    const result = await response.json()
    console.log('Airtable success, records count:', result.records?.length || 0)
    
    res.status(200).json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    })
  }
}