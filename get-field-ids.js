// Get actual field IDs from Airtable using the Meta API
async function getFieldIds() {
  try {
    console.log("🔍 Getting actual field IDs from Airtable Meta API...");
    
    // We need to use the Meta API to get field IDs
    // First let's try to get the base metadata
    const metaResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'meta/bases'
      })
    });
    
    if (!metaResponse.ok) {
      console.log("❌ Meta API failed, trying alternative approach...");
      
      // Alternative: Create a minimal record to see the actual field structure
      console.log("📝 Creating test record to discover field IDs...");
      
      // Try creating a minimal record with just the company name to see what happens
      const testRecord = {
        records: [{
          fields: {
            'Nazwa firmy': 'TEST - Field ID Discovery',
            'NIP firmy': '1234567890'
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
        const result = await createResponse.json();
        console.log("✅ Test record created successfully!");
        console.log("Record ID:", result.records[0].id);
        
        // Now get it back to see the field structure
        const getResponse = await fetch('http://localhost:3001/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'GET', 
            endpoint: `tbl2SOkYU0eBG2ZGj/${result.records[0].id}`
          })
        });
        
        if (getResponse.ok) {
          const record = await getResponse.json();
          console.log("📋 Retrieved record structure:");
          console.log("Fields:", record.fields);
          
          // Clean up - delete the test record
          await fetch('http://localhost:3001/api/airtable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'DELETE',
              endpoint: `tbl2SOkYU0eBG2ZGj/${result.records[0].id}`
            })
          });
          console.log("🧹 Test record cleaned up");
        }
      } else {
        const errorText = await createResponse.text();
        console.log("❌ Failed to create test record:", errorText);
      }
    } else {
      const metaData = await metaResponse.json();
      console.log("📊 Base metadata:", metaData);
    }
    
    console.log("\n💡 Based on the current table structure, we need to use field NAMES, not IDs.");
    console.log("The current fields in the company table are:");
    console.log("- 'ID formularza'");
    console.log("- 'Nazwa firmy'"); 
    console.log("- 'NIP firmy'");
    console.log("- 'PKD firmy'");
    console.log("- 'Osoba uprawniona'");
    console.log("- 'Telefon przedstawiciela'");
    console.log("- etc...");
    
  } catch (error) {
    console.error("Error getting field IDs:", error);
  }
}

getFieldIds();