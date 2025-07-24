// Vercel serverless function - ukrywa API key
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Prywatne env variables (bez VITE_ prefix)
  const AIRTABLE_CONFIG = {
    pat: process.env.AIRTABLE_PAT,
    baseId: process.env.AIRTABLE_BASE_ID,
    applicationsTableId: process.env.AIRTABLE_APPLICATIONS_TABLE_ID,
    employeesTableId: process.env.AIRTABLE_EMPLOYEES_TABLE_ID,
    baseUrl: 'https://api.airtable.com/v0'
  };

  try {
    const { method, endpoint, data } = req.body || req.query;
    
    const airtableUrl = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${endpoint}`;
    
    const response = await fetch(airtableUrl, {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Airtable API error:', {
        status: response.status,
        statusText: response.statusText,
        result: result,
        url: airtableUrl,
        method: method || 'GET'
      });
      throw new Error(`Airtable error: ${response.status} - ${JSON.stringify(result)}`);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Airtable proxy error:', error);
    console.error('Request details:', {
      method: method || 'GET',
      endpoint,
      dataSize: data ? JSON.stringify(data).length : 0
    });
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}