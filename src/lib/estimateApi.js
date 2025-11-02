// API functions for estimate management (admin functions)
import { API_BASE, TEST_LOCATION_ID } from './quoteStorage';

/**
 * Update item prices in GHL estimate
 * @param {string} estimateId - Estimate ID
 * @param {string} locationId - Location ID
 * @param {Array} items - Array of items with updated prices { id, name, amount, qty, description, currency }
 * @returns {Promise<Object>} Update result
 */
export async function updateEstimatePrices(estimateId, locationId, items) {
  // Fetch current estimate to get all required fields
  const getResp = await fetch(`${API_BASE}/wp-json/ca/v1/estimate?estimateId=${estimateId}&locationId=${locationId || TEST_LOCATION_ID}&raw=1`);
  if (!getResp.ok) {
    const text = await getResp.text();
    throw new Error(`Failed to fetch estimate: ${getResp.status} ${text}`);
  }
  
  const getData = await getResp.json();
  if (!getData.ok || !getData.raw) {
    throw new Error('Estimate not found or invalid response');
  }
  
  const current = getData.raw;
  
  // Match updated items with current estimate items to preserve descriptions
  const currentItems = current.items || [];
  const updatedItems = items.map((item, idx) => {
    // Try to find matching item in current estimate by ID, then by index
    const currentItem = currentItems.find(ci => 
      (ci.id || ci._id) === item.id
    ) || currentItems[idx] || {};
    
    return {
      name: item.name || currentItem.name || '',
      description: currentItem.description || item.description || item.desc || '',
      currency: item.currency || currentItem.currency || current.currency || 'USD',
      amount: item.amount || 0, // Updated price
      qty: item.qty || currentItem.qty || currentItem.quantity || 1
    };
  });
  
  // Build compliant update payload (mirror ca_apply_estimate_photos pattern)
  const currency = current.currency || (current.currencyOptions?.code || 'USD');
  const name40 = (current.name || current.title || 'Estimate').substring(0, 40);
  const title = current.title || 'ESTIMATE';
  const business = current.businessDetails || [{ name: 'Cheap Alarms' }];
  const contact = current.contactDetails || {
    name: (current.contact?.firstName || '') + ' ' + (current.contact?.lastName || ''),
    email: current.contact?.email || '',
    phoneNo: current.contact?.phone || ''
  };
  const discount = current.discount || { type: 'percentage', value: 0 };
  
  const fmtDate = (v, fallback) => {
    if (v) {
      const t = new Date(v).getTime();
      if (!isNaN(t)) return new Date(t).toISOString().split('T')[0];
    }
    return fallback ? new Date(fallback).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  };
  
  const issueDate = fmtDate(current.issueDate);
  const expiryDate = fmtDate(current.expiryDate, Date.now() + 30*24*60*60*1000);
  const frequencySettings = current.frequencySettings || { enabled: false };
  const liveMode = current.liveMode !== undefined ? current.liveMode : true;
  
  // Preserve existing terms (with upload link)
  const existingTerms = current.termsNotes || '';
  
  const payload = {
    estimateId,
    altId: locationId || TEST_LOCATION_ID,
    altType: 'location',
    name: name40,
    title,
    businessDetails: business,
    currency,
    discount,
    contactDetails: contact,
    issueDate,
    expiryDate,
    frequencySettings,
    liveMode,
    items: updatedItems,
    termsNotes: existingTerms
  };
  
  // PUT to WP bridge
  const updateResp = await fetch(`${API_BASE}/wp-json/ca/v1/estimate/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!updateResp.ok) {
    const text = await updateResp.text();
    throw new Error(`Failed to update estimate: ${updateResp.status} ${text}`);
  }
  
  const updateData = await updateResp.json();
  if (!updateData.ok) {
    throw new Error(updateData.err || 'Update failed');
  }
  
  return updateData;
}
