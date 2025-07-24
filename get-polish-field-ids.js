// Get field IDs for current Polish field names using Airtable Web API
async function getPolishFieldIds() {
  try {
    console.log("🔍 Getting field IDs for Polish field names...");
    
    // Method: Use Airtable Web API to get base schema
    // We'll try the web API approach first
    const baseId = process.env.AIRTABLE_BASE_ID || 'appkNl5oQEBdEo6PJ';
    
    console.log("Using base ID:", baseId);
    
    // Try to get schema via web API
    const webApiUrl = `https://airtable.com/v0.3/application/${baseId}/read`;
    
    const webResponse = await fetch(webApiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (webResponse.ok) {
      const webData = await webResponse.json();
      console.log("📊 Web API Schema Data:");
      
      if (webData.data && webData.data.tableSchemas) {
        webData.data.tableSchemas.forEach(table => {
          console.log(`\nTable: ${table.name} (${table.id})`);
          if (table.columns) {
            table.columns.forEach(column => {
              console.log(`  "${column.name}" → ${column.id}`);
            });
          }
        });
      } else {
        console.log("Schema structure different than expected:", Object.keys(webData));
      }
    } else {
      console.log("Web API failed, trying alternative method...");
      
      // Alternative: Create records with known field names and inspect the response
      console.log("📝 Using record inspection method to get field IDs...");
      
      // Get a record and inspect its structure in the response
      const recordResponse = await fetch('http://localhost:3001/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'tbl2SOkYU0eBG2ZGj?maxRecords=1&returnFieldsByFieldId=true'
        })
      });
      
      if (recordResponse.ok) {
        const recordData = await recordResponse.json();
        console.log("📋 Record with field IDs:");
        console.log(JSON.stringify(recordData, null, 2));
      } else {
        console.log("Record inspection failed, trying create method...");
        
        // Method 3: Create a record and see the field structure in the response
        const testRecord = {
          records: [{
            fields: {
              'Nazwa firmy': 'FIELD_ID_DISCOVERY_TEST'
            }
          }]
        };
        
        const createResponse = await fetch('http://localhost:3001/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'POST',
            endpoint: 'tbl2SOkYU0eBG2ZGj',
            data: testRecord
          })
        });
        
        if (createResponse.ok) {
          const createResult = await createResponse.json();
          console.log("📝 Created record response (may contain field IDs):");
          console.log(JSON.stringify(createResult, null, 2));
          
          // Delete the test record
          const recordId = createResult.records[0].id;
          await fetch('http://localhost:3001/api/airtable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'DELETE',
              endpoint: `tbl2SOkYU0eBG2ZGj/${recordId}`
            })
          });
          console.log("🧹 Test record cleaned up");
        }
      }
    }
    
    // Manual field ID discovery by testing each field name
    console.log("\n🕵️ Manual field ID discovery...");
    
    const polishFields = [
      'ID formularza',
      'Nazwa firmy',
      'NIP firmy',
      'PKD firmy',
      'Osoba uprawniona',
      'Telefon przedstawiciela',
      'Imię i nazwisko osoby kontaktowej',
      'Telefon osoby kontaktowej',
      'Email osoby kontaktowej',
      'Nazwa banku',
      'rachunek bankowy',
      'Liczba pracowników',
      'Data złożenia',
      'Utworzono'
    ];
    
    // Try the API meta endpoint approach
    console.log("\n🔍 Trying API meta endpoint...");
    try {
      // Try different meta endpoints
      const metaEndpoints = [
        `meta/bases/${baseId}/tables`,
        `meta/bases/${baseId}`,
        'meta/whoami'
      ];
      
      for (const endpoint of metaEndpoints) {
        try {
          const metaResponse = await fetch('http://localhost:3001/api/airtable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'GET',
              endpoint: endpoint
            })
          });
          
          if (metaResponse.ok) {
            const metaData = await metaResponse.json();
            console.log(`✅ ${endpoint} response:`, JSON.stringify(metaData, null, 2));
          } else {
            console.log(`❌ ${endpoint} failed:`, await metaResponse.text());
          }
        } catch (error) {
          console.log(`❌ ${endpoint} error:`, error.message);
        }
      }
    } catch (error) {
      console.log("Meta endpoint discovery failed:", error);
    }
    
  } catch (error) {
    console.error("Error getting Polish field IDs:", error);
  }
}

// Load environment
import { config } from 'dotenv';
config();

getPolishFieldIds();