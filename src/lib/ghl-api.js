// GoHighLevel (GHL) direct API integration for lead submission
// Usage: import { submitLeadToGHL } from './ghl-api'
// Reads `VITE_DISABLE_GHL_INTEGRATION`, `VITE_GHL_TOKEN`, `VITE_GHL_LOCATION_ID`

const isDisabled = import.meta.env.VITE_DISABLE_GHL_INTEGRATION === 'true';
const GHL_TOKEN = import.meta.env.VITE_GHL_TOKEN || '';
const GHL_LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID || '';

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

export default { submitLeadToGHL };