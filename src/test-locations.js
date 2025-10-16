// Test GoHighLevel Locations Access
// This will show us what locations this token can access

const GHL_TOKEN = 'pit-62db7e86-56e6-4bd1-a4ba-9c435c84de22';
const BASE_URL = 'https://services.leadconnectorhq.com';

async function testLocations() {
  console.log('🏢 Testing GoHighLevel Locations Access...\n');

  try {
    console.log('📍 Fetching available locations...');
    
    // Try the specific location endpoint format from the documentation
    const specificLocationResponse = await fetch(`${BASE_URL}/locations/aLTXtdwNknfmEFo3WBIX`, {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });

    console.log(`📊 Specific Location Response: ${specificLocationResponse.status} - ${specificLocationResponse.statusText}`);

    if (specificLocationResponse.ok) {
      const locationData = await specificLocationResponse.json();
      console.log('✅ Specific Location Access: SUCCESS!');
      console.log(`   Location Name: ${locationData.name || 'Unknown'}`);
      console.log(`   Location ID: ${locationData.id}`);
      console.log(`   Address: ${locationData.address || 'N/A'}`);
      console.log('\n🎉 Your location ID is correct and accessible!');
    } else {
      const errorText = await specificLocationResponse.text();
      console.log('❌ Specific Location Access: FAILED');
      console.log(`📄 Response Body: ${errorText}`);
    }
  } catch (error) {
    console.log('❌ Locations Access: ERROR');
    console.log(`   Error: ${error.message}`);
  }
}

// Run the test
testLocations().catch(console.error);