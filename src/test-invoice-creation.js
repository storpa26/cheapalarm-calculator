// Test GoHighLevel Invoice Creation
// This tests the actual endpoint we need for draft creation

const GHL_TOKEN = 'pit-62db7e86-56e6-4bd1-a4ba-9c435c84de22';
const GHL_LOCATION_ID = 'aLTXtdwNknfmEFo3WBIX';
const BASE_URL = 'https://services.leadconnectorhq.com';

async function testInvoiceCreation() {
  console.log('🧪 Testing GoHighLevel Invoice Creation...\n');

  // Test creating a draft estimate (the actual endpoint we need)
  try {
    console.log('📝 Testing Draft Estimate Creation...');
    
    const payload = {
      action: 'draft',
      locationId: GHL_LOCATION_ID,
      title: 'Test Estimate - Cheap Alarms',
      currency: 'AUD',
      liveMode: false,
      items: [
        {
          name: 'Test Security System',
          description: 'Basic security package for testing',
          price: 299.00,
          qty: 1
        }
      ],
      notes: 'This is a test estimate created via API'
    };

    console.log('📤 Sending request to:', `${BASE_URL}/invoices/`);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/invoices/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`📊 Response Status: ${response.status} - ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Invoice Creation: SUCCESS!');
      console.log('📋 Created Invoice/Estimate:');
      console.log(`   ID: ${result.id || 'N/A'}`);
      console.log(`   Title: ${result.title || 'N/A'}`);
      console.log(`   Status: ${result.status || 'N/A'}`);
      console.log(`   Total: ${result.total || 'N/A'}`);
      console.log('\n🎉 Your GoHighLevel integration is working!');
    } else {
      const errorText = await response.text();
      console.log('❌ Invoice Creation: FAILED');
      console.log(`📄 Response Body: ${errorText}`);
      
      // Analyze the error
      if (response.status === 403) {
        console.log('\n🔍 Analysis: 403 Forbidden usually means:');
        console.log('   • Token has correct scope but wrong location access');
        console.log('   • Location ID might be incorrect');
        console.log('   • Account settings may restrict API access');
      } else if (response.status === 401) {
        console.log('\n🔍 Analysis: 401 Unauthorized means:');
        console.log('   • Token is invalid or expired');
        console.log('   • Missing required scopes');
      }
    }
  } catch (error) {
    console.log('❌ Invoice Creation: ERROR');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🔧 Debug Info:');
  console.log(`   Token: ${GHL_TOKEN.substring(0, 20)}...`);
  console.log(`   Location: ${GHL_LOCATION_ID}`);
  console.log(`   Endpoint: ${BASE_URL}/invoices/`);
}

// Run the test
testInvoiceCreation().catch(console.error);