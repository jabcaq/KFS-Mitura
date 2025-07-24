// Check current Airtable schema to get correct field IDs
async function checkAirtableSchema() {
  try {
    console.log("🔍 Checking Airtable schema...");
    
    // Get company table schema
    console.log("\n📋 Company table (tbl2SOkYU0eBG2ZGj):");
    const companyResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tbl2SOkYU0eBG2ZGj?maxRecords=1'
      })
    });
    
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      if (companyData.records && companyData.records.length > 0) {
        const fields = companyData.records[0].fields;
        console.log("Available fields:", Object.keys(fields));
        console.log("Sample record:", fields);
      } else {
        console.log("No records found in company table");
      }
    } else {
      console.log("Error fetching company table:", await companyResponse.text());
    }

    // Get employees table schema
    console.log("\n👥 Employees table (tblh7tsaWWwXxBgSi):");
    const employeeResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tblh7tsaWWwXxBgSi?maxRecords=1'
      })
    });
    
    if (employeeResponse.ok) {
      const employeeData = await employeeResponse.json();
      if (employeeData.records && employeeData.records.length > 0) {
        const fields = employeeData.records[0].fields;
        console.log("Available fields:", Object.keys(fields));
        console.log("Sample record:", fields);
      } else {
        console.log("No records found in employee table");
      }
    } else {
      console.log("Error fetching employee table:", await employeeResponse.text());
    }
    
  } catch (error) {
    console.error("Error checking schema:", error);
  }
}

checkAirtableSchema();