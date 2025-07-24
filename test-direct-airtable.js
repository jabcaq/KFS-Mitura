// Test bezpośredni z Airtable API
import dotenv from 'dotenv';
dotenv.config();

async function testDirectAirtable() {
  console.log('🔍 Test bezpośredni z Airtable API...\n');
  
  const PAT = process.env.AIRTABLE_PAT;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  
  console.log('PAT exists:', !!PAT);
  console.log('BASE_ID:', BASE_ID);
  
  if (!PAT || !BASE_ID) {
    console.log('❌ Brak wymaganych env variables');
    return;
  }
  
  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Tables found:', data.tables?.length || 0);
      
      // Znajdź nasze tabele i pokaż opcje select
      data.tables.forEach(table => {
        if (table.id === 'tbl2SOkYU0eBG2ZGj' || table.id === 'tblh7tsaWWwXxBgSi') {
          console.log(`\n📋 ${table.name} (ID: ${table.id})`);
          
          const selectFields = table.fields.filter(f => 
            f.type === 'singleSelect' || f.type === 'multipleSelect'
          );
          
          if (selectFields.length > 0) {
            selectFields.forEach(field => {
              console.log(`\n  ${field.name} (ID: ${field.id}) - Type: ${field.type}`);
              if (field.options && field.options.choices) {
                console.log('  Opcje:');
                field.options.choices.forEach(choice => {
                  console.log(`    - "${choice.name}"`);
                });
              }
            });
          } else {
            console.log('  Brak pól select');
          }
        }
      });
      
      // Wygeneruj mapping
      console.log('\n\n🎯 GENERATED SELECT OPTIONS MAPPING:');
      console.log('const SELECT_OPTIONS = {');
      
      data.tables.forEach(table => {
        if (table.id === 'tbl2SOkYU0eBG2ZGj' || table.id === 'tblh7tsaWWwXxBgSi') {
          const selectFields = table.fields.filter(f => 
            f.type === 'singleSelect' || f.type === 'multipleSelect'
          );
          
          selectFields.forEach(field => {
            if (field.options && field.options.choices) {
              const choices = field.options.choices.map(c => `"${c.name}"`).join(', ');
              console.log(`  // ${table.name} - ${field.name}`);
              console.log(`  "${field.name}": [${choices}],`);
            }
          });
        }
      });
      
      console.log('};');
      
    } else {
      const errorText = await response.text();
      console.log('❌ Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
  }
}

testDirectAirtable();