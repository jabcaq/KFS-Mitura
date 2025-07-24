// Vercel serverless function for KAS API (darmowe API podatników VAT)
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nip } = req.query;

  if (!nip) {
    return res.status(400).json({ 
      success: false, 
      error: 'NIP parameter is required' 
    });
  }

  try {
    // Clean NIP - remove dashes and spaces
    const cleanNip = nip.replace(/[-\s]/g, '');
    
    console.log(`🆓 Fetching KAS data for NIP: ${cleanNip}`);

    // KAS API endpoint - darmowe API podatników VAT
    const kasUrl = `https://wl-api.mf.gov.pl/api/search/nip/${cleanNip}?date=${new Date().toISOString().split('T')[0]}`;
    
    const response = await fetch(kasUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'FormularzApp/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`🆓 KAS API HTTP error: ${response.status}`);
      return res.status(200).json({ 
        success: false, 
        error: `KAS API error: ${response.status}`,
        kasStatus: response.status 
      });
    }

    const data = await response.json();
    console.log('🆓 KAS API response:', { 
      success: true, 
      hasSubjects: data.result?.subjects?.length > 0,
      subjectsCount: data.result?.subjects?.length || 0
    });

    // Return the data in our standard format
    res.status(200).json({ 
      success: true, 
      result: data.result,
      source: 'KAS' 
    });

  } catch (error) {
    console.error('🆓 KAS API error:', error.message);
    res.status(200).json({ 
      success: false, 
      error: error.message,
      source: 'KAS'
    });
  }
}