// Simple development server for API proxying
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// CORS middleware
app.use(cors());
app.use(express.json());

// GUS API endpoint
app.get('/api/gus', async (req, res) => {
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

    const gusUrl = `https://rejestr.io/api/v2/org/nip${cleanNip}`;
    
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
      
      // If it's a 403 (no credits), return mock data for demo purposes
      if (response.status === 403 && data.info?.includes('Brak kredytu')) {
        console.log('Returning mock data due to no API credits');
        const mockData = {
          success: true,
          data: {
            nip: cleanNip,
            regon: "123456789",
            nazwa: "Przykładowa Firma Sp. z o.o.",
            adres_pelny: "ul. Marszałkowska 1, 00-001 Warszawa",
            ulica: "Marszałkowska",
            nr_domu: "1",
            nr_lokalu: null,
            kod_pocztowy: "00-001",
            miejscowosc: "Warszawa",
            pkd_kod: "62.01.Z",
            pkd_opis: "Działalność związana z oprogramowaniem",
            forma_prawna: "SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
            data_rejestracji: "2020-01-15",
            data_rozpoczecia_dzialalnosci: "2020-02-01",
            status: "AKTYWNA"
          }
        };
        res.status(200).json(mockData);
        return;
      }
      
      res.status(response.status).json({
        success: false,
        error: data.message || data.info || `GUS API error: ${response.status}`
      });
      return;
    }

    // Return success format expected by frontend
    res.status(200).json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('GUS proxy error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Błąd podczas pobierania danych z GUS. Sprawdź połączenie internetowe.' 
    });
  }
});

// Airtable proxy endpoint (existing functionality)
app.all('/api/airtable', async (req, res) => {
  const AIRTABLE_CONFIG = {
    pat: process.env.AIRTABLE_PAT,
    baseId: process.env.AIRTABLE_BASE_ID,
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
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Development API server running on port ${PORT}`);
  console.log(`GUS endpoint: http://localhost:${PORT}/api/gus`);
  console.log(`Airtable endpoint: http://localhost:${PORT}/api/airtable`);
});