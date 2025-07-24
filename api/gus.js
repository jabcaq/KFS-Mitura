// Vercel serverless function - proxy for GUS API to avoid CORS
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const GUS_API_KEY = process.env.GUS_API_KEY;
  
  if (!GUS_API_KEY) {
    console.error('Missing GUS_API_KEY environment variable');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const { nip } = req.query;
    
    if (!nip) {
      res.status(400).json({ 
        success: false, 
        error: 'NIP parameter is required' 
      });
      return;
    }

    // Clean NIP - remove dashes and spaces
    const cleanNip = nip.replace(/[-\s]/g, '');
    
    // Validate NIP format (10 digits)
    if (!/^\d{10}$/.test(cleanNip)) {
      res.status(400).json({
        success: false,
        error: 'Nieprawidłowy format NIP. NIP powinien zawierać 10 cyfr.'
      });
      return;
    }

    console.log(`Fetching GUS data for NIP: ${cleanNip}`);

    const gusUrl = `https://rejestr.io/api/v2/gus?nip=${cleanNip}`;
    
    const response = await fetch(gusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GUS_API_KEY}`,
        'User-Agent': 'FormularzApp/1.0'
      }
    });

    const data = await response.json();
    
    console.log('GUS API response:', {
      status: response.status,
      success: data.success,
      hasData: !!data.data
    });
    
    if (!response.ok) {
      console.error('GUS API error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      res.status(response.status).json({
        success: false,
        error: data.message || `GUS API error: ${response.status}`
      });
      return;
    }

    // Return the data as received from GUS API
    res.status(200).json(data);
    
  } catch (error) {
    console.error('GUS proxy error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd podczas pobierania danych z GUS. Sprawdź połączenie internetowe.' 
    });
  }
}