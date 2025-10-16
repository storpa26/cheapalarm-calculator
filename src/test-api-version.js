console.log('🔍 Testing GoHighLevel API with Version Header...\n');

const token = 'pit-195d44e7-6b55-4e86-aa33-1c039d458e5c';
const locationId = 'aLTXtdwNknfmEFo3WBIX';

console.log('📋 Token Information:');
console.log(`   Token: ${token.substring(0, 20)}...`);
console.log(`   Location ID: ${locationId}\n`);

// Test different API version headers
const baseUrl = 'https://services.leadconnectorhq.com';

async function testWithVersionHeader(versionHeader) {
    console.log(`🧪 Testing with Version Header: ${versionHeader || 'NONE'}...`);
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    if (versionHeader) {
        headers['Version'] = versionHeader;
    }
    
    try {
        const response = await fetch(`${baseUrl}/locations/${locationId}`, {
            method: 'GET',
            headers
        });
        
        console.log(`   Status: ${response.status} - ${response.statusText}`);
        
        if (response.ok) {
            console.log(`   ✅ SUCCESS with version: ${versionHeader || 'NONE'}`);
            const data = await response.json();
            console.log(`   Location: ${data.name || 'Unknown'}`);
        } else {
            const errorText = await response.text();
            console.log(`   ❌ FAILED`);
            console.log(`   Response: ${errorText.substring(0, 200)}...`);
        }
        
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
}

async function runTests() {
    // Test without version header
    await testWithVersionHeader(null);
    
    // Test with common version headers
    await testWithVersionHeader('2021-07-28');
    await testWithVersionHeader('2021-04-15');
    await testWithVersionHeader('v2');
    await testWithVersionHeader('2.0');
    
    console.log('🏁 Version header tests completed!');
}

runTests().catch(console.error);