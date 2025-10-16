// Test script for GHL invoice creation with fixed payload structure
const GHL_TOKEN = 'pit-195d44e7-6b55-4e86-aa33-1c039d458e5c';
const GHL_LOCATION_ID = 'aLTXtdwNknfmEFo3WBIX';

async function testInvoiceCreation() {
  console.log('🧪 Testing Invoice Creation with Fixed Payload...');
  
  // Sample payload with proper structure based on GHL API docs
  const testPayload = {
    altId: GHL_LOCATION_ID,
    altType: 'location',
    name: 'Test Invoice - Security System',
    title: 'INVOICE',
    businessDetails: {
      name: 'Cheap Alarms',
      phoneNo: '0412345678',
      address: {
        addressLine1: '123 Test Street',
        city: 'Sydney',
        state: 'NSW',
        postalCode: '2000',
        countryCode: 'AU'
      }
    },
    currency: 'AUD',
    items: [
      {
        name: 'Security System Installation',
        description: 'Basic security system with 2 cameras',
        amount: 50000, // Amount in cents (500.00 AUD)
        qty: 1,
        currency: 'AUD'
      }
    ],
    contactDetails: {
      id: 'YEEQKjNivsSj5dQRDNPW', // Using existing contact ID from your GHL system
      name: 'Test Customer',
      phoneNo: '+61412345678',
      email: 'test@example.com',
      address: {
        addressLine1: '123 Test Street',
        city: 'Sydney',
        state: 'NSW',
        postalCode: '2000',
        countryCode: 'AU'
      }
    },
    invoiceNumber: '1001',
    issueDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    liveMode: false,
    automaticTaxesEnabled: false,
    action: 'draft',
    termsNotes: 'Test invoice created to verify API payload structure'
  };

  try {
    const response = await fetch('https://services.leadconnectorhq.com/invoices/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    let responseJson = null;
    
    try {
      responseJson = JSON.parse(responseText);
    } catch (e) {
      console.log('❌ Failed to parse response as JSON');
    }

    console.log(`📊 Response Status: ${response.status} - ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ SUCCESS! Invoice created successfully');
      console.log('📄 Response:', JSON.stringify(responseJson, null, 2));
    } else {
      console.log('❌ FAILED');
      console.log('📄 Error Response:', responseJson || responseText);
      
      if (response.status === 422) {
        console.log('🔍 Validation Errors:');
        if (responseJson?.message && Array.isArray(responseJson.message)) {
          responseJson.message.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
          });
        }
      }
    }

  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

// Run the test
testInvoiceCreation();