// GoHighLevel (GHL) direct API integration for lead submission and draft document creation
// Usage: import { submitLeadToGHL, createDraftDocument } from './ghl-api'
// Reads `VITE_DISABLE_GHL_INTEGRATION`, `VITE_GHL_TOKEN`, `VITE_GHL_LOCATION_ID`

const isDisabled = import.meta.env.VITE_DISABLE_GHL_INTEGRATION === 'true';
const GHL_TOKEN = import.meta.env.VITE_GHL_TOKEN || '';
const GHL_LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID || '';
const DOC_DEFAULT_TYPE = import.meta.env.DOC_DEFAULT_TYPE || 'estimate';

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') return false;
  const { name, email, phone, address, postcode } = payload;
  if (!name || !email || !phone || !address || !postcode) return false;
  const emailOk = /.+@.+\..+/.test(email);
  const phoneOk = /^(\+?61|0)[0-9\s-]{8,}$/.test(phone);
  return emailOk && phoneOk;
}

export async function submitLeadToGHL(payload) {
  if (isDisabled) {
    await new Promise(r => setTimeout(r, 500));
    return { success: true, disabled: true };
  }

  if (!validatePayload(payload)) {
    return { success: false, error: 'Invalid payload' };
  }

  if (!GHL_TOKEN || !GHL_LOCATION_ID) {
    return { success: false, error: 'Missing GHL token or location ID' };
  }

  const nameParts = String(payload.name).trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  const contactData = {
    firstName,
    lastName,
    email: payload.email,
    phone: payload.phone,
    address1: payload.address,
    postalCode: payload.postcode,
    source: 'Website Lead Form',
    tags: ['Website Lead'],
    locationId: GHL_LOCATION_ID,
    customFields: [],
  };

  if (payload.productContext) {
    const pc = payload.productContext;
    contactData.customFields.push(
      { key: 'product_name', field_value: pc.productName || `${pc.productType} ${pc.context} System` },
      { key: 'product_type', field_value: pc.productType },
      { key: 'product_context', field_value: pc.context },
      { key: 'estimated_total', field_value: pc.estimatedTotal || 0 },
      { key: 'selected_addons', field_value: Array.isArray(pc.selectedAddons) ? pc.selectedAddons.join(', ') : '' },
    );
    contactData.tags.push(`Product: ${pc.productType}`, `Context: ${pc.context}`);
  }

  if (payload.propertyContext) {
    const prc = payload.propertyContext;
    contactData.customFields.push(
      { key: 'property_type', field_value: prc.propertyType },
      { key: 'building_type', field_value: prc.buildingType },
    );
    if (prc.storeyType) contactData.customFields.push({ key: 'storey_type', field_value: prc.storeyType });
    if (prc.ceilingType) contactData.customFields.push({ key: 'ceiling_type', field_value: prc.ceilingType });
    contactData.tags.push(`Property: ${prc.propertyType}`, `Building: ${prc.buildingType}`);
  }

  try {
    const resp = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
      },
      body: JSON.stringify(contactData),
    });

    const text = await resp.text();
    let json = null;
    try { json = JSON.parse(text); } catch { json = null; }

    if (!resp.ok) {
      const details = json?.error || json?.message || text || 'Unknown error';
      return { success: false, error: `GHL API failed: ${resp.status} - ${details}` };
    }

    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Creates a draft estimate or invoice in GoHighLevel
 * @param {Object} payload - Form data with contact info, cart items, and context
 * @param {string} [docType] - 'estimate' or 'invoice' (defaults to DOC_DEFAULT_TYPE)
 * @returns {Promise<Object>} - { success: boolean, type?: string, id?: string, url?: string, error?: string }
 */
export async function createDraftDocument(payload, docType = DOC_DEFAULT_TYPE) {
  if (isDisabled) {
    await new Promise(r => setTimeout(r, 800));
    return { 
      success: true, 
      disabled: true, 
      type: docType,
      id: 'dev-draft-' + Date.now(),
      url: null
    };
  }

  // Validate environment
  if (!GHL_TOKEN || !GHL_LOCATION_ID) {
    return { success: false, error: 'Missing GHL token or location ID' };
  }

  // Validate payload
  if (!validatePayload(payload)) {
    return { success: false, error: 'Invalid contact payload' };
  }

  // Validate cart items
  if (!payload.productContext?.cart || !Array.isArray(payload.productContext.cart) || payload.productContext.cart.length === 0) {
    return { success: false, error: 'Empty cart after normalization' };
  }

  try {
    // Step 1: Upsert contact
    const contactResult = await upsertContact(payload);
    if (!contactResult.success) {
      return { success: false, error: `Contact creation failure: ${contactResult.error}` };
    }

    const contactId = contactResult.contactId;

    // Step 2: Create draft document
    const documentResult = await createDocument(contactId, payload, docType);
    if (!documentResult.success) {
      return { success: false, error: `Draft creation failure: ${documentResult.error}` };
    }

    return {
      success: true,
      type: docType,
      id: documentResult.id,
      url: documentResult.url || null
    };

  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Upserts a contact in GoHighLevel (create or update by email)
 */
async function upsertContact(payload) {
  const nameParts = String(payload.name).trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  // First, try to find existing contact by email
  try {
    const searchResp = await fetch(`https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(payload.email)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
      },
    });

    if (searchResp.ok) {
      const searchResult = await searchResp.json();
      if (searchResult.contact && searchResult.contact.id) {
        return { success: true, contactId: searchResult.contact.id };
      }
    }
  } catch (searchErr) {
    // Continue with contact creation
  }

  const contactData = {
    firstName,
    lastName,
    email: payload.email,
    phone: payload.phone,
    address1: payload.address,
    postalCode: payload.postcode,
    source: 'Website Calculator',
    tags: ['Website Lead', 'Calculator Quote'],
    locationId: GHL_LOCATION_ID,
    customFields: [],
  };

  // Add product context to custom fields
  if (payload.productContext) {
    const pc = payload.productContext;
    contactData.customFields.push(
      { key: 'product_name', field_value: pc.productName || `${pc.productType} ${pc.context} System` },
      { key: 'product_type', field_value: pc.productType },
      { key: 'product_context', field_value: pc.context },
      { key: 'estimated_total', field_value: pc.estimatedTotal || 0 },
      { key: 'selected_addons', field_value: Array.isArray(pc.selectedAddons) ? pc.selectedAddons.join(', ') : '' },
    );
    contactData.tags.push(`Product: ${pc.productType}`, `Context: ${pc.context}`);
  }

  // Add property context to custom fields
  if (payload.propertyContext) {
    const prc = payload.propertyContext;
    contactData.customFields.push(
      { key: 'property_type', field_value: prc.propertyType },
      { key: 'building_type', field_value: prc.buildingType },
    );
    if (prc.storeyType) contactData.customFields.push({ key: 'storey_type', field_value: prc.storeyType });
    if (prc.ceilingType) contactData.customFields.push({ key: 'ceiling_type', field_value: prc.ceilingType });
    contactData.tags.push(`Property: ${prc.propertyType}`, `Building: ${prc.buildingType}`);
  }

  try {
    const resp = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
      },
      body: JSON.stringify(contactData),
    });

    const text = await resp.text();
    let json = null;
    try { json = JSON.parse(text); } catch { json = null; }

    if (!resp.ok) {
      // If it's a duplicate contact error, try to find the existing contact
      if (resp.status === 400 && (text.includes('duplicate') || text.includes('already exists'))) {
        // Try alternative search methods
        try {
          const searchByEmailResp = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(payload.email)}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${GHL_TOKEN}`,
              'Content-Type': 'application/json',
              Version: '2021-07-28',
            },
          });

          if (searchByEmailResp.ok) {
            const searchData = await searchByEmailResp.json();
            if (searchData.contacts && searchData.contacts.length > 0) {
              const existingContact = searchData.contacts.find(c => c.email === payload.email);
              if (existingContact) {
                return { success: true, contactId: existingContact.id };
              }
            }
          }
        } catch (fallbackErr) {
          // Continue with error handling
        }
      }

      const details = json?.error || json?.message || text || 'Unknown error';
      return { success: false, error: `${resp.status} - ${details}` };
    }

    // Extract contact ID from response
    const contactId = json?.contact?.id || json?.id;
    if (!contactId) {
      return { success: false, error: 'No contact ID returned from GHL' };
    }

    return { success: true, contactId };

  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Network error' 
    };
  }
}

/**
 * Creates a draft estimate or invoice in GoHighLevel
 */
async function createDocument(contactId, payload, docType) {
  // Map cart items to line items
  const lineItems = mapCartToLineItems(payload.productContext.cart, payload.productContext.context);
  
  // Calculate dates
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const expiryDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // 30 days from now
  
  // Build document data with correct structure for GoHighLevel API (matching working request)
  const documentData = {
    altId: GHL_LOCATION_ID,
    altType: 'location',
    name: `${docType === 'estimate' ? 'Estimate' : 'Invoice'} - ${payload.name || 'Customer'}`,
    title: docType === 'estimate' ? 'ESTIMATE' : 'INVOICE',
    businessDetails: { 
      name: 'Cheap Alarms',
      address: {
        addressLine1: 'Cheap Alarms Pty Ltd',
        city: 'Brisbane',
        state: 'QLD',
        postalCode: '4000',
        countryCode: 'AU'
      }
    },
    currency: 'USD',
    items: lineItems,
    discount: { type: 'percentage', value: 0 },
    termsNotes: `<p>Quote generated from website configurator.</p>`,
    contactDetails: {
      id: contactId,
      name: payload.name,
      email: payload.email,
      phoneNo: payload.phone?.startsWith('+') ? payload.phone : `+61${payload.phone?.replace(/^0/, '') || ''}`,
      address: {
        addressLine1: payload.address || 'Address not provided',
        city: 'TBD',
        state: 'TBD',
        postalCode: payload.postcode || 'TBD',
        countryCode: 'AU'
      }
    },
    issueDate,
    expiryDate,
    frequencySettings: { enabled: false },
    liveMode: true
  };

  try {
    // Primary path: create via WordPress bridge so server injects Terms link
    const bridgeResp = await fetch('/wp-json/ca/v1/estimate/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(documentData),
    });

    const bridgeText = await bridgeResp.text();
    let bridgeJson = null; try { bridgeJson = JSON.parse(bridgeText); } catch {}
    if (bridgeResp.ok && bridgeJson?.ok) {
      const result = bridgeJson.result || {};
      const documentId = result?.estimate?.id || result?._id || result?.id;
      const documentUrl = result?.estimate?.liveUrl || result?.liveUrl || result?.url || null;

      // Best-effort: ensure link via annotate as well
      if (documentId && GHL_LOCATION_ID) {
        try {
          await fetch('/wp-json/ca/v1/estimate/annotate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estimateId: documentId, locationId: GHL_LOCATION_ID })
          });
        } catch {}
      }

      if (!documentId) return { success: false, error: 'Bridge create succeeded but no estimate ID' };
      return { success: true, id: documentId, url: documentUrl };
    }

    // Fallback: create directly in GHL (legacy path)
    const endpoint = `https://services.leadconnectorhq.com/invoices/${docType === 'estimate' ? 'estimate' : ''}`;
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
      },
      body: JSON.stringify(documentData),
    });
    const text = await resp.text();
    let json = null; try { json = JSON.parse(text); } catch {}
    if (!resp.ok) {
      const details = json?.error || json?.message || text || 'Unknown error';
      return { success: false, error: `${resp.status} - ${details}` };
    }
    const documentId = json?._id || json?.estimate?.id || json?.id;
    const documentUrl = json?.liveUrl || json?.estimate?.liveUrl || json?.url;
    if (!documentId) return { success: false, error: 'No document ID returned from GHL' };

    // Ensure link via annotate when created directly
    try {
      await fetch('/wp-json/ca/v1/estimate/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimateId: documentId, locationId: GHL_LOCATION_ID })
      });
    } catch {}

    return { success: true, id: documentId, url: documentUrl };

  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

/**
 * Maps cart items to GHL line items format
 */
function mapCartToLineItems(cart, context) {
  const lineItems = [];

  for (const item of cart) {
    // Handle unit price - could be object with context or simple number
    let unitPrice = 0;
    if (typeof item.unitPrice === 'object' && item.unitPrice !== null && item.unitPrice[context]) {
      unitPrice = item.unitPrice[context];
    } else if (typeof item.unitPrice === 'number') {
      unitPrice = item.unitPrice;
    }

    const lineItem = {
      name: item.name || 'Unknown Item',
      description: item.description || 'One-off service',
      amount: Math.round(unitPrice), // GHL expects amount in dollars, not cents
      qty: item.qty || item.quantity || 1,
      type: 'one_time',
      taxInclusive: true,
      currency: 'USD'
    };

    lineItems.push(lineItem);
  }

  // Handle discount as separate line item if needed
  const totalBeforeDiscount = lineItems.reduce((sum, item) => sum + (item.amount * item.qty), 0);
  const targetTotal = cart.find(item => item.targetTotal)?.targetTotal;
  
  if (targetTotal && targetTotal < totalBeforeDiscount) {
    const discountAmount = totalBeforeDiscount - targetTotal;
    lineItems.push({
      name: 'Discount',
      description: 'Applied discount to reach target price',
      amount: -discountAmount, // Negative amount in dollars
      qty: 1,
      type: 'one_time',
      taxInclusive: true,
      currency: 'USD'
    });
  }

  return lineItems;
}

export default { submitLeadToGHL, createDraftDocument };