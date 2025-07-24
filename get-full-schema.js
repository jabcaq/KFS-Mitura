// Get full schema of both tables to map all fields
async function getFullSchema() {
  try {
    console.log("🔍 Getting full schema of both tables...");
    
    // Get all company records to see full field structure
    console.log("\n📋 COMPANY TABLE (tbl2SOkYU0eBG2ZGj):");
    const companyResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tbl2SOkYU0eBG2ZGj?maxRecords=5'
      })
    });
    
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      if (companyData.records && companyData.records.length > 0) {
        // Collect all unique field names across all records
        const allFields = new Set();
        companyData.records.forEach(record => {
          Object.keys(record.fields).forEach(field => allFields.add(field));
        });
        
        console.log("All available company fields:");
        Array.from(allFields).sort().forEach((field, index) => {
          console.log(`${index + 1}. "${field}"`);
        });
        
        console.log("\nSample record:");
        console.log(JSON.stringify(companyData.records[0].fields, null, 2));
      }
    } else {
      console.log("Error fetching company table:", await companyResponse.text());
    }

    // Get all employee records to see full field structure
    console.log("\n👥 EMPLOYEE TABLE (tblh7tsaWWwXxBgSi):");
    const employeeResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tblh7tsaWWwXxBgSi?maxRecords=5'
      })
    });
    
    if (employeeResponse.ok) {
      const employeeData = await employeeResponse.json();
      if (employeeData.records && employeeData.records.length > 0) {
        // Collect all unique field names across all records
        const allFields = new Set();
        employeeData.records.forEach(record => {
          Object.keys(record.fields).forEach(field => allFields.add(field));
        });
        
        console.log("All available employee fields:");
        Array.from(allFields).sort().forEach((field, index) => {
          console.log(`${index + 1}. "${field}"`);
        });
        
        console.log("\nSample record:");
        console.log(JSON.stringify(employeeData.records[0].fields, null, 2));
      }
    } else {
      console.log("Error fetching employee table:", await employeeResponse.text());
    }
    
  } catch (error) {
    console.error("Error getting full schema:", error);
  }
}

getFullSchema();