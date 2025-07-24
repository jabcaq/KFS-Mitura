// Get all tables from Airtable base to see complete structure
async function getAllTables() {
  try {
    console.log("🔍 Getting all tables from Airtable base...");
    
    // Try to get base schema through meta API
    const schemaResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'meta/bases'
      })
    });
    
    if (schemaResponse.ok) {
      const schema = await schemaResponse.json();
      console.log("📊 Base schema:", JSON.stringify(schema, null, 2));
    } else {
      console.log("Meta API not accessible, trying manual table discovery...");
      
      // Let's try the tables we know exist and see if we can find more
      const knownTables = [
        { id: 'tbl2SOkYU0eBG2ZGj', name: 'Company/Dane podmiotu' },
        { id: 'tblh7tsaWWwXxBgSi', name: 'Employees/Pracownicy' }
      ];
      
      for (const table of knownTables) {
        console.log(`\n📋 TABLE: ${table.name} (${table.id})`);
        
        try {
          const response = await fetch('http://localhost:3001/api/airtable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'GET',
              endpoint: `${table.id}?maxRecords=2`
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.records && data.records.length > 0) {
              // Get all unique fields from all records
              const allFields = new Set();
              data.records.forEach(record => {
                Object.keys(record.fields).forEach(field => allFields.add(field));
              });
              
              console.log(`Fields found (${allFields.size}):`);
              Array.from(allFields).sort().forEach((field, index) => {
                console.log(`  ${index + 1}. "${field}"`);
              });
              
              console.log("\nSample record:");
              console.log(JSON.stringify(data.records[0].fields, null, 2));
              
              if (data.records[1]) {
                console.log("\nAnother sample record:");
                console.log(JSON.stringify(data.records[1].fields, null, 2));
              }
            } else {
              console.log("No records found in this table");
            }
          } else {
            const errorText = await response.text();
            console.log(`Error accessing table: ${errorText}`);
          }
        } catch (error) {
          console.log(`Error with table ${table.name}:`, error.message);
        }
      }
      
      // Try to discover if there are other tables by trying some common patterns
      console.log("\n🔍 Trying to discover additional tables...");
      const possibleTableIds = [
        'tblDanePodmiotu',
        'tblPracownicy', 
        'tblFormularze',
        'tblWnioski',
        'tblApplications',
        'tblEmployees',
        'tblCompanies'
      ];
      
      for (const tableId of possibleTableIds) {
        try {
          const response = await fetch('http://localhost:3001/api/airtable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'GET',
              endpoint: `${tableId}?maxRecords=1`
            })
          });
          
          if (response.ok) {
            console.log(`✅ Found additional table: ${tableId}`);
            const data = await response.json();
            if (data.records && data.records.length > 0) {
              const fields = Object.keys(data.records[0].fields);
              console.log(`  Fields: ${fields.join(', ')}`);
            }
          }
        } catch (error) {
          // Silent fail for discovery
        }
      }
    }
    
  } catch (error) {
    console.error("Error getting all tables:", error);
  }
}

getAllTables();