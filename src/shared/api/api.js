// WooCommerce Store API client with nonce rotation and cart operations
const WP_BASE_URL = import.meta.env.VITE_WP_BASE_URL || 'https://cheapalarms.com.au';
const STORE_API_BASE = '/wp-json/wc/store/v1';
const VALIDATE_ENDPOINT = '/wp-json/ca/v1/alarm/validate';

const config = {
  wordpress: {
    baseUrl: WP_BASE_URL,
    storeApiBase: STORE_API_BASE,
    validateEndpoint: VALIDATE_ENDPOINT,
  },
  system: {
    basePrice: { residential: 1295, retail: 1495, office: 1495, warehouse: 1795 },
    limits: { inputs: 32, onboardInputs: 8, keypads: 8, powerBudget: 1000, touchscreenThreshold: 2 },
  },
  products: {
    wireless: { addonCategory: 'alarm-addon', baseProductSlug: 'hybrid-wireless-alarm-system' },
    hardwired: {
      baseCategory: 'wired-base-package',
      baseTag: 'wired-base-package',
      addonCategory: 'wired-alarm-addon',
      addonTag: 'wired-alarm-addon',
      autoRequiredCategory: 'wired-alarm-auto-required',
      autoRequiredTag: 'wired-alarm-auto-required',
    },
  },
};

class WooCommerceAPI {
  nonce = null;

  async bootstrap() {
    try { await this.getCart(); } catch {}
  }

  async makeRequest(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (this.nonce) headers['Nonce'] = this.nonce;

    const res = await fetch(endpoint, { ...options, headers, credentials: 'include' });

    const newNonce =
      res.headers.get('Nonce') ||
      res.headers.get('nonce') ||
      res.headers.get('X-WC-Store-API-Nonce') ||
      res.headers.get('x-wc-store-api-nonce');
    if (newNonce) this.nonce = newNonce;

    if (!res.ok) {
      let body = null;
      try { body = await res.json(); } catch {}
      const msg = body ? `HTTP ${res.status}: ${JSON.stringify(body)}` : `HTTP ${res.status} ${res.statusText}`;
      throw new Error(msg);
    }
    return res.json();
  }

  async getProducts(params = {}) {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.tag) qs.set('tag', params.tag);
    if (params.slug) qs.set('slug', params.slug);
    if (params.per_page) qs.set('per_page', String(params.per_page));
    if (params.include?.length) qs.set('include', params.include.join(','));
    const url = `${config.wordpress.storeApiBase}/products?${qs.toString()}`;
    return this.makeRequest(url);
  }

  async getAlarmAddonProducts(productType = 'wireless', perPage = 100) {
    const productConfig = config.products[productType];
    if (!productConfig) throw new Error(`Invalid product type: ${productType}`);

    if (productType === 'wireless') {
      return this.getProducts({ category: productConfig.addonCategory, per_page: perPage });
    }
    return this.getProducts({
      category: productConfig.addonCategory,
      tag: productConfig.addonTag,
      per_page: perPage,
    });
  }

  async getBaseAlarmProduct(productType = 'wireless') {
    const productConfig = config.products[productType];
    if (!productConfig) throw new Error(`Invalid product type: ${productType}`);

    if (productType === 'wireless') {
      const products = await this.getProducts({ slug: productConfig.baseProductSlug, per_page: 1 });
      if (products.length) return products[0];
      const all = await this.getProducts({ per_page: 50 });
      return all.find(p =>
        p.name.toLowerCase().includes('hybrid') &&
        p.name.toLowerCase().includes('wireless') &&
        p.name.toLowerCase().includes('alarm')
      ) || null;
    }
    const products = await this.getProducts({
      category: productConfig.baseCategory,
      tag: productConfig.baseTag,
      per_page: 1,
    });
    return products.length ? products[0] : null;
  }

  async getAutoRequiredProducts(productType = 'wireless', perPage = 100) {
    const productConfig = config.products[productType];
    if (!productConfig) throw new Error(`Invalid product type: ${productType}`);

    if (productType === 'wireless') {
      return this.getProducts({ tag: 'auto-required', per_page: perPage });
    }
    return this.getProducts({
      category: productConfig.autoRequiredCategory,
      tag: productConfig.autoRequiredTag,
      per_page: perPage,
    });
  }

  async getCart() {
    const url = `${config.wordpress.storeApiBase}/cart`;
    return this.makeRequest(url);
  }

  async addItemsToCart(items) {
    if (!this.nonce) await this.getCart();
    let cart = null;
    const url = `${config.wordpress.storeApiBase}/cart/add-item`;
    for (const item of items) {
      if (!this.nonce) await this.getCart();
      const payload = {
        id: item.id,
        quantity: item.quantity,
        meta: item.meta ?? {},
        ...(item.variation_id ? { variation_id: item.variation_id } : {}),
        ...(item.variation ? { variation: item.variation } : {}),
      };
      cart = await this.makeRequest(url, { method: 'POST', body: JSON.stringify(payload) });
    }
    return cart;
  }

  async updateCartItem(key, quantity) {
    if (!this.nonce) await this.getCart();
    const url = `${config.wordpress.storeApiBase}/cart/items/${key}`;
    return this.makeRequest(url, { method: 'POST', body: JSON.stringify({ quantity }) });
  }

  async removeCartItem(key) {
    if (!this.nonce) await this.getCart();
    const url = `${config.wordpress.storeApiBase}/cart/items/${key}`;
    return this.makeRequest(url, { method: 'DELETE' });
  }

  async clearCart() {
    if (!this.nonce) await this.getCart();
    const url = `${config.wordpress.storeApiBase}/cart`;
    return this.makeRequest(url, { method: 'DELETE' });
  }

  async validateConfiguration(payload) {
    return this.makeRequest(config.wordpress.validateEndpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const wooApi = new WooCommerceAPI();
wooApi.bootstrap().catch(() => {});