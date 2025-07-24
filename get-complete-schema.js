// Get complete schema with all fields and their options
async function getCompleteSchema() {
  try {
    console.log("🔍 Getting complete schema for both tables...\n");
    
    // Get company table with all records to see all possible fields
    console.log("📋 COMPANY TABLE (tbl2SOkYU0eBG2ZGj):");
    const companyResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tbl2SOkYU0eBG2ZGj'
      })
    });
    
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      
      // Collect all unique field names
      const allCompanyFields = new Set();
      companyData.records.forEach(record => {
        Object.keys(record.fields).forEach(field => allCompanyFields.add(field));
      });
      
      console.log("All company fields found:");
      Array.from(allCompanyFields).sort().forEach((field, index) => {
        console.log(`  ${index + 1}. "${field}"`);
      });
      
      // Get field IDs for all fields using the first complete record
      console.log("\n🆔 Getting field IDs for company table...");
      const companyFieldIdResponse = await fetch('http://localhost:3001/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'tbl2SOkYU0eBG2ZGj?maxRecords=1&returnFieldsByFieldId=true'
        })
      });
      
      if (companyFieldIdResponse.ok) {
        const companyFieldIdData = await companyFieldIdResponse.json();
        console.log("\nCompany Field ID mapping:");
        const fieldIdRecord = companyFieldIdData.records[0];
        
        // Match field IDs with names by cross-referencing
        const companyNameRecord = companyData.records.find(r => r.id === fieldIdRecord.id);
        if (companyNameRecord) {
          Object.keys(fieldIdRecord.fields).forEach(fieldId => {
            const value = fieldIdRecord.fields[fieldId];
            // Find matching field name
            const matchingFieldName = Object.keys(companyNameRecord.fields).find(
              fieldName => companyNameRecord.fields[fieldName] === value
            );
            if (matchingFieldName) {
              console.log(`  '${matchingFieldName}' → ${fieldId}`);
            }
          });
        }
      }
      
      console.log("\n📄 Sample company record:");
      if (companyData.records.length > 0) {
        console.log(JSON.stringify(companyData.records[0].fields, null, 2));
      }
    }

    // Get employee table with all records
    console.log("\n\n👥 EMPLOYEE TABLE (tblh7tsaWWwXxBgSi):");
    const employeeResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tblh7tsaWWwXxBgSi'
      })
    });
    
    if (employeeResponse.ok) {
      const employeeData = await employeeResponse.json();
      
      // Collect all unique field names
      const allEmployeeFields = new Set();
      employeeData.records.forEach(record => {
        Object.keys(record.fields).forEach(field => allEmployeeFields.add(field));
      });
      
      console.log("All employee fields found:");
      Array.from(allEmployeeFields).sort().forEach((field, index) => {
        console.log(`  ${index + 1}. "${field}"`);
      });
      
      // Get field IDs for employee table
      console.log("\n🆔 Getting field IDs for employee table...");
      const employeeFieldIdResponse = await fetch('http://localhost:3001/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'tblh7tsaWWwXxBgSi?maxRecords=1&returnFieldsByFieldId=true'
        })
      });
      
      if (employeeFieldIdResponse.ok) {
        const employeeFieldIdData = await employeeFieldIdResponse.json();
        console.log("\nEmployee Field ID mapping:");
        const fieldIdRecord = employeeFieldIdData.records[0];
        
        // Match field IDs with names
        const employeeNameRecord = employeeData.records.find(r => r.id === fieldIdRecord.id);
        if (employeeNameRecord) {
          Object.keys(fieldIdRecord.fields).forEach(fieldId => {
            const value = fieldIdRecord.fields[fieldId];
            const matchingFieldName = Object.keys(employeeNameRecord.fields).find(
              fieldName => employeeNameRecord.fields[fieldName] === value
            );
            if (matchingFieldName) {
              console.log(`  '${matchingFieldName}' → ${fieldId}`);
            }
          });
        }
      }
      
      console.log("\n📄 Sample employee record:");
      if (employeeData.records.length > 0) {
        console.log(JSON.stringify(employeeData.records[0].fields, null, 2));
      }
    }
    
    // Check for select/choice field options by examining multiple records
    console.log("\n\n🎯 ANALYZING SELECT FIELD OPTIONS:");
    
    // Look for fields that might have limited options (select fields)
    const companySelectFields = new Map();
    const employeeSelectFields = new Map();
    
    // Analyze company records for select patterns
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      companyData.records.forEach(record => {
        Object.entries(record.fields).forEach(([fieldName, value]) => {
          if (typeof value === 'string' && value.length < 50) { // Likely select option
            if (!companySelectFields.has(fieldName)) {
              companySelectFields.set(fieldName, new Set());
            }
            companySelectFields.get(fieldName).add(value);
          }
        });
      });
    }
    
    console.log("Company potential select fields:");
    companySelectFields.forEach((values, fieldName) => {
      if (values.size <= 10) { // Only show fields with reasonable number of options
        console.log(`  "${fieldName}": [${Array.from(values).map(v => `"${v}"`).join(', ')}]`);
      }
    });
    
    // Analyze employee records for select patterns
    if (employeeResponse.ok) {
      const employeeData = await employeeResponse.json();
      employeeData.records.forEach(record => {
        Object.entries(record.fields).forEach(([fieldName, value]) => {
          if (typeof value === 'string' && value.length < 50) {
            if (!employeeSelectFields.has(fieldName)) {
              employeeSelectFields.set(fieldName, new Set());
            }
            employeeSelectFields.get(fieldName).add(value);
          }
        });
      });
    }
    
    console.log("\nEmployee potential select fields:");
    employeeSelectFields.forEach((values, fieldName) => {
      if (values.size <= 10) {
        console.log(`  "${fieldName}": [${Array.from(values).map(v => `"${v}"`).join(', ')}]`);
      }
    });
    
  } catch (error) {
    console.error("Error getting schema:", error);
  }
}

getCompleteSchema();