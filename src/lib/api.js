// Placeholder API functions for WooCommerce integration
export const wooApi = {
  async getProducts() {
    // Placeholder function - would normally fetch from WooCommerce
    return [];
  },
  
  async getBaseAlarmProduct(productType) {
    // Placeholder function - would normally fetch base alarm product from WooCommerce
    console.log('Fetching base alarm product for:', productType);
    return {
      id: 1,
      name: `${productType} Base Alarm System`,
      prices: {
        price: '29900', // $299.00 in cents
        currency_minor_unit: 2
      },
      short_description: `Base ${productType} alarm system`
    };
  },

  async getAlarmAddonProducts(productType) {
    // Placeholder function - would normally fetch addon products from WooCommerce
    console.log('Fetching alarm addon products for:', productType);
    return [
      {
        id: 101,
        name: 'Door/Window Sensor',
        prices: { price: '2500', currency_minor_unit: 2 },
        short_description: 'Wireless door/window sensor',
        meta_data: [
          { key: '_price_residential', value: '25.00' },
          { key: '_price_retail', value: '30.00' },
          { key: '_price_office', value: '28.00' },
          { key: '_price_warehouse', value: '32.00' },
          { key: '_addon_type', value: 'sensor' },
          { key: '_consumes_input', value: 'yes' },
          { key: '_power_milliamps', value: '10' }
        ]
      },
      {
        id: 102,
        name: 'Motion Detector',
        prices: { price: '3500', currency_minor_unit: 2 },
        short_description: 'PIR motion detector',
        meta_data: [
          { key: '_price_residential', value: '35.00' },
          { key: '_price_retail', value: '40.00' },
          { key: '_price_office', value: '38.00' },
          { key: '_price_warehouse', value: '42.00' },
          { key: '_addon_type', value: 'sensor' },
          { key: '_consumes_input', value: 'yes' },
          { key: '_power_milliamps', value: '15' }
        ]
      }
    ];
  },

  async getAutoRequiredProducts(productType) {
    // Placeholder function - would normally fetch auto-required products from WooCommerce
    console.log('Fetching auto-required products for:', productType);
    return [
      {
        id: 201,
        name: 'Power Supply',
        prices: { price: '4500', currency_minor_unit: 2 },
        short_description: 'Main power supply unit',
        meta_data: [
          { key: '_price_residential', value: '45.00' },
          { key: '_price_retail', value: '50.00' },
          { key: '_price_office', value: '48.00' },
          { key: '_price_warehouse', value: '52.00' },
          { key: '_addon_type', value: 'power' },
          { key: '_consumes_input', value: 'no' },
          { key: '_power_milliamps', value: '0' },
          { key: '_auto_appended', value: 'yes' }
        ]
      }
    ];
  },

  async addItemsToCart(items) {
    // Placeholder function - would normally add items to WooCommerce cart
    console.log('Adding items to cart:', items);
    return { success: true, cart_id: 'cart_123' };
  },

  async getCart() {
    // Placeholder function - would normally fetch current cart from WooCommerce
    console.log('Fetching cart');
    return {
      items: [],
      total: '0.00',
      currency: 'AUD'
    };
  },
  
  async addToCart(items) {
    // Placeholder function - would normally add items to WooCommerce cart
    console.log('Adding to cart:', items);
    return { success: true };
  }
};