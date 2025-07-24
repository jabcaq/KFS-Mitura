// Get all field IDs for complete mapping
async function getAllFieldIds() {
  try {
    console.log("🗺️ Getting ALL field IDs for complete mapping...\n");
    
    // Get a record with many fields filled to see more field IDs
    console.log("📋 COMPANY TABLE - All Field IDs:");
    
    // Get multiple records to capture all possible field IDs
    const companyResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tbl2SOkYU0eBG2ZGj?returnFieldsByFieldId=true'
      })
    });
    
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      
      // Collect all field IDs from all records
      const allFieldIds = new Set();
      companyData.records.forEach(record => {
        Object.keys(record.fields).forEach(fieldId => allFieldIds.add(fieldId));
      });
      
      console.log(`Found ${allFieldIds.size} field IDs in company table:`);
      Array.from(allFieldIds).sort().forEach(fieldId => {
        console.log(`  ${fieldId}`);
      });
      
      // Now map each field ID to its name by creating a test record
      console.log("\n🔍 Mapping field IDs to Polish names:");
      
      // Get one complete record for mapping
      const sampleRecord = companyData.records.find(r => Object.keys(r.fields).length > 5);
      if (sampleRecord) {
        // Get the same record with field names
        const nameResponse = await fetch('http://localhost:3001/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'GET', 
            endpoint: `tbl2SOkYU0eBG2ZGj/${sampleRecord.id}`
          })
        });
        
        if (nameResponse.ok) {
          const nameRecord = await nameResponse.json();
          console.log("\nCOMPANY FIELD MAPPING:");
          
          // Match values to create mapping
          Object.entries(sampleRecord.fields).forEach(([fieldId, value]) => {
            const matchingFieldName = Object.keys(nameRecord.fields).find(
              fieldName => nameRecord.fields[fieldName] === value
            );
            if (matchingFieldName) {
              console.log(`  ${matchingFieldName}: '${fieldId}',`);
            }
          });
        }
      }
    }
    
    console.log("\n\n👥 EMPLOYEE TABLE - All Field IDs:");
    
    const employeeResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tblh7tsaWWwXxBgSi?returnFieldsByFieldId=true'
      })
    });
    
    if (employeeResponse.ok) {
      const employeeData = await employeeResponse.json();
      
      // Collect all field IDs
      const allEmployeeFieldIds = new Set();
      employeeData.records.forEach(record => {
        Object.keys(record.fields).forEach(fieldId => allEmployeeFieldIds.add(fieldId));
      });
      
      console.log(`Found ${allEmployeeFieldIds.size} field IDs in employee table:`);
      Array.from(allEmployeeFieldIds).sort().forEach(fieldId => {
        console.log(`  ${fieldId}`);
      });
      
      // Map employee field IDs
      const sampleEmpRecord = employeeData.records.find(r => Object.keys(r.fields).length > 3);
      if (sampleEmpRecord) {
        const empNameResponse = await fetch('http://localhost:3001/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'GET',
            endpoint: `tblh7tsaWWwXxBgSi/${sampleEmpRecord.id}`
          })
        });
        
        if (empNameResponse.ok) {
          const empNameRecord = await empNameResponse.json();
          console.log("\nEMPLOYEE FIELD MAPPING:");
          
          Object.entries(sampleEmpRecord.fields).forEach(([fieldId, value]) => {
            const matchingFieldName = Object.keys(empNameRecord.fields).find(
              fieldName => empNameRecord.fields[fieldName] === value
            );
            if (matchingFieldName) {
              console.log(`  ${matchingFieldName}: '${fieldId}',`);
            }
          });
        }
      }
    }
    
    // Check for select field options in the newest records
    console.log("\n\n🎯 SELECT FIELD OPTIONS FROM RECENT RECORDS:");
    
    // Get recent company records to see select options
    const recentCompanyResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tbl2SOkYU0eBG2ZGj?sort[0][field]=Data%20złożenia&sort[0][direction]=desc&maxRecords=5'
      })
    });
    
    if (recentCompanyResponse.ok) {
      const recentCompanyData = await recentCompanyResponse.json();
      console.log("Recent company records with all fields:");
      recentCompanyData.records.forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`);
        Object.entries(record.fields).forEach(([fieldName, value]) => {
          console.log(`  "${fieldName}": ${JSON.stringify(value)}`);
        });
      });
    }
    
  } catch (error) {
    console.error("Error getting all field IDs:", error);
  }
}

getAllFieldIds();