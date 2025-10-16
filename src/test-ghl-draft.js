// Test script for GHL draft document creation
// Run this in browser console to test the new functionality

import { createDraftDocument } from './lib/ghl-api.js';

// Test payload matching the specification
const testPayload = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '0412345678',
  address: '123 Test Street, Sydney NSW',
  postcode: '2000',
  estimationNote: 'Hey, standard is $4,000, we\'ll do $3,000',
  productContext: {
    productType: 'alarm',
    context: 'residential',
    productName: 'Residential Alarm System',
    estimatedTotal: 3000,
    selectedAddons: ['outpir'],
    cart: [
      {
        name: '6.6kW Solar System',
        qty: 1,
        unitPrice: 4000,
        description: 'Standard residential solar system'
      },
      {
        name: 'Discount',
        qty: 1,
        unitPrice: -1000,
        description: 'Special pricing discount'
      }
    ]
  },
  propertyContext: {
    propertyType: 'residential',
    buildingType: 'house'
  }
};

// Test function
async function testDraftCreation() {
  console.log('Testing GHL draft document creation...');
  console.log('Payload:', testPayload);
  
  try {
    const result = await createDraftDocument(testPayload, 'estimate');
    console.log('Result:', result);
    
    if (result.success) {
      console.log('✅ Success! Draft estimate created:');
      console.log(`- Type: ${result.type}`);
      console.log(`- ID: ${result.id}`);
      console.log(`- URL: ${result.url || 'Not provided'}`);
    } else {
      console.log('❌ Failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Export for manual testing
window.testGHLDraft = testDraftCreation;
console.log('Test function available as window.testGHLDraft()');