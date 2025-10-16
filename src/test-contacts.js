// Test script to check existing contacts and create a dummy contact
const GHL_TOKEN = 'pit-195d44e7-6b55-4e86-aa33-1c039d458e5c';
const GHL_LOCATION_ID = 'aLTXtdwNknfmEFo3WBIX';

async function checkContacts() {
  console.log('📋 Checking existing contacts...');
  
  try {
    const response = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=5`, {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Contacts API working');
      if (data.contacts && data.contacts.length > 0) {
        console.log(`📞 Found ${data.contacts.length} existing contacts:`);
        data.contacts.forEach((contact, i) => {
          console.log(`   ${i+1}. ID: ${contact.id}`);
          console.log(`      Name: ${contact.name || 'No name'}`);
          console.log(`      Email: ${contact.email || 'No email'}`);
          console.log(`      Phone: ${contact.phone || 'No phone'}`);
          console.log('');
        });
        
        // Use the first contact ID for testing
        const testContactId = data.contacts[0].id;
        console.log(`🎯 Using contact ID for testing: ${testContactId}`);
        return testContactId;
      } else {
        console.log('📭 No existing contacts found');
        console.log('🔄 Creating a dummy contact for testing...');
        return await createDummyContact();
      }
    } else {
      console.log('❌ Failed to fetch contacts:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error checking contacts:', error.message);
    return null;
  }
}

async function createDummyContact() {
  const dummyContact = {
    firstName: 'Test',
    lastName: 'Customer',
    name: 'Test Customer',
    email: 'test@cheapalarms.com.au',
    phone: '+61412345678',
    locationId: GHL_LOCATION_ID
  };

  try {
    const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(dummyContact)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Dummy contact created successfully');
      console.log(`🆔 Contact ID: ${data.contact.id}`);
      return data.contact.id;
    } else {
      console.log('❌ Failed to create dummy contact:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error creating dummy contact:', error.message);
    return null;
  }
}

// Run the test
checkContacts().then(contactId => {
  if (contactId) {
    console.log(`\n🎉 SUCCESS! You can use this contact ID: ${contactId}`);
    console.log('\n💡 To fix the invoice issue, update your ghl-api.js file to use this contact ID');
    console.log('   or implement contact creation before invoice creation.');
  } else {
    console.log('\n❌ Could not get or create a contact ID');
  }
});