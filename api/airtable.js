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

  // Extract request data outside try block for error logging
  let method, endpoint, data;
  
  try {
    ({ method, endpoint, data } = req.body || req.query);
    
    // Validate required fields
    if (!endpoint) {
      throw new Error('Missing endpoint parameter');
    }
    
    // Check if required env vars are present
    if (!AIRTABLE_CONFIG.pat || !AIRTABLE_CONFIG.baseId) {
      throw new Error('Missing required environment variables: AIRTABLE_PAT or AIRTABLE_BASE_ID');
    }
    
    console.log('Airtable request:', {
      method: method || 'GET',
      endpoint,
      hasData: !!data,
      dataSize: data ? JSON.stringify(data).length : 0
    });
    
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

    console.log('Airtable success response');
    res.status(200).json(result);
  } catch (error) {
    console.error('Airtable proxy error:', error.message);
    console.error('Request details:', {
      method: method || 'GET',
      endpoint: endpoint || 'undefined',
      dataSize: data ? JSON.stringify(data).length : 0,
      hasAirtablePat: !!AIRTABLE_CONFIG.pat,
      hasBaseId: !!AIRTABLE_CONFIG.baseId
    });
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      debug: {
        hasAirtablePat: !!AIRTABLE_CONFIG.pat,
        hasBaseId: !!AIRTABLE_CONFIG.baseId,
        endpoint: endpoint || 'missing'
      }
    });
  }
}