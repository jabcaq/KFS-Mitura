// Discover field IDs using Airtable REST API features
async function discoverFieldIds() {
  try {
    console.log("🔍 Discovering field IDs using REST API...");
    
    // Method 1: Use returnFieldsByFieldId parameter
    console.log("\n📋 Method 1: Using returnFieldsByFieldId=true");
    const fieldIdResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tbl2SOkYU0eBG2ZGj?maxRecords=1&returnFieldsByFieldId=true'
      })
    });
    
    if (fieldIdResponse.ok) {
      const data = await fieldIdResponse.json();
      console.log("✅ Response with field IDs:");
      console.log(JSON.stringify(data, null, 2));
      
      // If this works, we should see field IDs instead of field names
      if (data.records && data.records.length > 0) {
        const record = data.records[0];
        console.log("\n📝 Field IDs found:");
        Object.keys(record.fields).forEach(fieldId => {
          console.log(`Field ID: ${fieldId}`);
        });
      }
    } else {
      console.log("❌ returnFieldsByFieldId failed:", await fieldIdResponse.text());
    }

    // Method 2: Try to get table schema using different endpoint
    console.log("\n📊 Method 2: Trying table schema endpoints");    
    const schemaEndpoints = [
      'tbl2SOkYU0eBG2ZGj/listRecords?includeFieldDetails=true',
      'tbl2SOkYU0eBG2ZGj?view=Grid%20view&cellFormat=json&timeZone=Europe/Warsaw&userLocale=en'
    ];
    
    for (const endpoint of schemaEndpoints) {
      try {
        const response = await fetch('http://localhost:3001/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'GET',
            endpoint: endpoint
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint} worked:`);
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log(`❌ ${endpoint} failed:`, response.status);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} error:`, error.message);
      }
    }

    // Method 3: Create a record with specific field names and analyze the response
    console.log("\n🧪 Method 3: Creating test record to analyze response structure");
    
    // Create a record with all known Polish field names
    const testData = {
      records: [{
        fields: {
          'ID formularza': 'FIELD-ID-TEST-999',
          'Nazwa firmy': 'Test Field IDs Discovery',
          'NIP firmy': '9999999999',
          'PKD firmy': 'TEST.TEST',
          'Osoba uprawniona': 'Test Person',
          'Telefon przedstawiciela': '999999999'
        }
      }]
    };
    
    const createResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'POST',
        endpoint: 'tbl2SOkYU0eBG2ZGj',
        data: testData
      })
    });
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      const recordId = createResult.records[0].id;
      console.log("✅ Test record created:", recordId);
      
      // Now try to retrieve it with field IDs
      const retrieveWithFieldIds = await fetch('http://localhost:3001/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: `tbl2SOkYU0eBG2ZGj/${recordId}?returnFieldsByFieldId=true`
        })
      });
      
      if (retrieveWithFieldIds.ok) {
        const fieldIdData = await retrieveWithFieldIds.json();
        console.log("🎯 Record retrieved with field IDs:");
        console.log(JSON.stringify(fieldIdData, null, 2));
        
        // Create mapping
        if (fieldIdData.fields) {
          console.log("\n📋 FIELD ID MAPPING FOR COMPANY TABLE:");
          Object.keys(fieldIdData.fields).forEach(fieldId => {
            const value = fieldIdData.fields[fieldId];
            console.log(`'${fieldId}': // Value: ${value}`);
          });
        }
      }
      
      // Clean up
      await fetch('http://localhost:3001/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'DELETE',
          endpoint: `tbl2SOkYU0eBG2ZGj/${recordId}`
        })
      });
      console.log("🧹 Test record cleaned up");
      
    } else {
      console.log("❌ Failed to create test record:", await createResponse.text());
    }

    // Method 4: Try the same for employees table
    console.log("\n👥 Method 4: Testing employees table field IDs");
    const employeeTestData = {
      records: [{
        fields: {
          'Id': 'TEST-EMP-999',
          'Imię i nazwisko': 'Test Employee',
          'Wiek': 99,
          'Stanowisko': 'Field ID Tester',
          'Początek umowy': '2024-01-01'
        }
      }]
    };
    
    const empCreateResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'POST',
        endpoint: 'tblh7tsaWWwXxBgSi',
        data: employeeTestData
      })
    });
    
    if (empCreateResponse.ok) {
      const empCreateResult = await empCreateResponse.json();
      const empRecordId = empCreateResult.records[0].id;
      console.log("✅ Employee test record created:", empRecordId);
      
      const empRetrieveWithFieldIds = await fetch('http://localhost:3001/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: `tblh7tsaWWwXxBgSi/${empRecordId}?returnFieldsByFieldId=true`
        })
      });
      
      if (empRetrieveWithFieldIds.ok) {
        const empFieldIdData = await empRetrieveWithFieldIds.json();
        console.log("🎯 Employee record with field IDs:");
        console.log(JSON.stringify(empFieldIdData, null, 2));
        
        if (empFieldIdData.fields) {
          console.log("\n👥 FIELD ID MAPPING FOR EMPLOYEE TABLE:");
          Object.keys(empFieldIdData.fields).forEach(fieldId => {
            const value = empFieldIdData.fields[fieldId];
            console.log(`'${fieldId}': // Value: ${value}`);
          });
        }
      }
      
      // Clean up
      await fetch('http://localhost:3001/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'DELETE',
          endpoint: `tblh7tsaWWwXxBgSi/${empRecordId}`
        })
      });
      console.log("🧹 Employee test record cleaned up");
    }
    
  } catch (error) {
    console.error("Error discovering field IDs:", error);
  }
}

discoverFieldIds();