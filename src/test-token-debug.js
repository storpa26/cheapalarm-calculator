console.log('🔍 Token Debug Information...\n');

// Use the updated token directly
const token = 'pit-195d44e7-6b55-4e86-aa33-1c039d458e5c';
const locationId = 'aLTXtdwNknfmEFo3WBIX';

console.log('📋 Token Information:');
console.log(`   Token: ${token.substring(0, 20)}...`);
console.log(`   Location ID: ${locationId}\n`);

if (!token) {
    console.log('❌ No token found in environment variables!');
    process.exit(1);
}

console.log(`🔑 Using token: ${token.substring(0, 20)}...\n`);

// Test different invoice endpoints
const baseUrl = 'https://services.leadconnectorhq.com';
const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28'
};

async function testEndpoint(name, url, method = 'GET', body = null) {
    console.log(`🧪 Testing ${name}...`);
    console.log(`   URL: ${url}`);
    
    try {
        const options = {
            method,
            headers,
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(url, options);
        const responseText = await response.text();
        
        console.log(`   Status: ${response.status} - ${response.statusText}`);
        
        if (response.ok) {
            console.log(`   ✅ SUCCESS`);
            if (responseText) {
                try {
                    const data = JSON.parse(responseText);
                    console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
                } catch {
                    console.log(`   Response: ${responseText.substring(0, 200)}...`);
                }
            }
        } else {
            console.log(`   ❌ FAILED`);
            console.log(`   Response: ${responseText}`);
        }
        
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
}

async function runTests() {
    // Test 1: List invoices (should work with View Invoices scope)
    await testEndpoint(
        'List Invoices', 
        `${baseUrl}/invoices/?locationId=${locationId}&limit=1`
    );
    
    // Test 2: Create invoice (needs all invoice scopes)
    const invoicePayload = {
        action: 'draft',
        locationId: locationId,
        title: 'API Test Invoice',
        currency: 'AUD',
        liveMode: false,
        items: [{
            name: 'Test Item',
            description: 'Test description',
            price: 100,
            qty: 1
        }]
    };
    
    await testEndpoint(
        'Create Invoice',
        `${baseUrl}/invoices/`,
        'POST',
        invoicePayload
    );
    
    // Test 3: Invoice templates (needs View Invoice Templates scope)
    await testEndpoint(
        'List Invoice Templates',
        `${baseUrl}/invoices/template?locationId=${locationId}&limit=1`
    );
    
    // Test 4: Invoice schedules (needs View Invoice Schedules scope)
    await testEndpoint(
        'List Invoice Schedules',
        `${baseUrl}/invoices/schedule?locationId=${locationId}&limit=1`
    );
    
    console.log('🏁 Debug tests completed!');
}

runTests().catch(console.error);