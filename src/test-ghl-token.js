// Test GoHighLevel Token Permissions
// Run this to check what your current token can access

const GHL_TOKEN = process.env.GHL_TOKEN || 'pit-195d44e7-6b55-4e86-aa33-1c039d458e5c';
const GHL_LOCATION_ID = 'aLTXtdwNknfmEFo3WBIX';
const BASE_URL = 'https://services.leadconnectorhq.com';

async function testTokenPermissions() {
  console.log('🔍 Testing GoHighLevel Token Permissions...\n');

  // Test 1: Basic location access
  try {
    console.log('1️⃣ Testing Location Access...');
    const locationResponse = await fetch(`${BASE_URL}/locations/${GHL_LOCATION_ID}`, {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });
    
    if (locationResponse.ok) {
      const locationData = await locationResponse.json();
      console.log('✅ Location access: SUCCESS');
      console.log(`   Location: ${locationData.location?.name || 'Unknown'}`);
    } else {
      console.log('❌ Location access: FAILED');
      console.log(`   Status: ${locationResponse.status} - ${locationResponse.statusText}`);
    }
  } catch (error) {
    console.log('❌ Location access: ERROR');
    console.log(`   Error: ${error.message}`);
  }

  console.log('');

  // Test 2: Contacts access
  try {
    console.log('2️⃣ Testing Contacts Access...');
    const contactsResponse = await fetch(`${BASE_URL}/contacts/?locationId=${GHL_LOCATION_ID}&limit=1`, {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });
    
    if (contactsResponse.ok) {
      console.log('✅ Contacts access: SUCCESS');
    } else {
      console.log('❌ Contacts access: FAILED');
      console.log(`   Status: ${contactsResponse.status} - ${contactsResponse.statusText}`);
    }
  } catch (error) {
    console.log('❌ Contacts access: ERROR');
    console.log(`   Error: ${error.message}`);
  }

  console.log('');

  // Test 3: Invoice access (the failing one)
  try {
    console.log('3️⃣ Testing Invoice Access...');
    const invoiceResponse = await fetch(`${BASE_URL}/invoices/?locationId=${GHL_LOCATION_ID}&limit=1`, {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });
    
    if (invoiceResponse.ok) {
      console.log('✅ Invoice access: SUCCESS');
    } else {
      const errorText = await invoiceResponse.text();
      console.log('❌ Invoice access: FAILED');
      console.log(`   Status: ${invoiceResponse.status} - ${invoiceResponse.statusText}`);
      console.log(`   Response: ${errorText}`);
    }
  } catch (error) {
    console.log('❌ Invoice access: ERROR');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🔍 Token Analysis:');
  console.log(`   Token Type: ${GHL_TOKEN.startsWith('pit-') ? 'Personal Access Token' : 'Other'}`);
  console.log(`   Location ID: ${GHL_LOCATION_ID}`);
  console.log('\n💡 Next Steps:');
  console.log('   1. Check your GoHighLevel plan includes API access');
  console.log('   2. Verify token has invoice.write permissions');
  console.log('   3. Consider regenerating token with proper scopes');
}

// Run the test
testTokenPermissions().catch(console.error);