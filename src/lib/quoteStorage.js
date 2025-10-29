// Quote data management utilities for the quote management system
// Handles fetching quotes from WordPress API and managing local storage

// API configuration
const API_BASE = "https://cheapalarms.com.au";
const TEST_ESTIMATE_ID = "68fddd36a5d4856a0fd07d40";
const TEST_LOCATION_ID = "aLTXtdwNknfmEFo3WBIX";

// Quote item structure
export const createQuoteItem = (item, index) => ({
  id: item.id || item._id || undefined,
  sku: `ITEM-${index + 1}`,
  name: item.name || "Unnamed Item",
  qty: item.qty || item.quantity || 1,
  desc: item.description || "",
});

// Photo item structure
export const createPhotoItem = (id, dataUrl, label, notes) => ({
  id: id || `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  dataUrl: dataUrl || "",
  label: label || "",
  notes: notes || "",
});

// Device slot structure
export const createDeviceSlot = (images = [], notes = "") => ({
  images: images || [],
  notes: notes || "",
});

// Main quote data structure
export const createQuoteData = (data) => {
  // Transform API response items to our format
  const items = (data.items || []).map((item, index) => createQuoteItem(item, index));
  
  // Initialize empty photo slots for each item
  const devices = {};
  items.forEach((item) => {
    devices[item.sku] = Array.from({ length: item.qty }, () => createDeviceSlot());
  });
  
  // Format address from object to string
  const formatAddress = (addr) => {
    if (typeof addr === "string") return addr;
    if (!addr) return "";
    
    const parts = [
      addr.addressLine1,
      addr.city,
      addr.state,
      addr.postalCode,
      addr.countryCode
    ].filter(Boolean);
    
    return parts.join(", ");
  };
  
  return {
    quoteId: data.estimateId || TEST_ESTIMATE_ID,
    customer: {
      name: data.contact?.name || data.contact?.email?.split("@")[0] || "Customer",
      email: data.contact?.email || "",
      phone: data.contact?.phone || "",
      address: formatAddress(data.contact?.address),
    },
    solution: data.title || "Estimate",
    items,
    photos: {
      general: [],
      devices,
    },
    submitted: false,
  };
};

// Fetch estimate from WordPress API
export async function fetchEstimate(estimateId, locationId) {
  const finalEstimateId = estimateId || TEST_ESTIMATE_ID;
  const finalLocationId = locationId || TEST_LOCATION_ID;
  
  const url = `${API_BASE}/wp-json/ca/v1/estimate?estimateId=${finalEstimateId}&locationId=${finalLocationId}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch estimate: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Create quote data from API response
    const quoteData = createQuoteData(data);
    
    // Try to load saved photos from localStorage
    const savedData = localStorage.getItem(`cheapalarms:quote:${finalEstimateId}`);
    const savedPhotos = savedData ? JSON.parse(savedData).photos : null;
    
    // Use saved photos if available, otherwise use initialized empty photos
    if (savedPhotos) {
      quoteData.photos = savedPhotos;
    }
    
    return quoteData;
  } catch (error) {
    console.error("Error fetching estimate:", error);
    throw error;
  }
}

// Local storage management
const STORAGE_KEY_PREFIX = "cheapalarms:quote:";

// Get quote data from localStorage
export function getQuoteData(quoteId) {
  const key = STORAGE_KEY_PREFIX + quoteId;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Return null if no data found
  return null;
}

// Save quote data to localStorage
export function saveQuoteData(data) {
  const key = STORAGE_KEY_PREFIX + data.quoteId;
  localStorage.setItem(key, JSON.stringify(data));
}

// Get photo statistics for progress tracking
export function getPhotoStats(data) {
  const generalPhotos = data.photos.general.length;
  let devicePhotos = 0;
  let completedSlots = 0;
  let totalSlots = 0;

  // Count device photos and slots
  Object.values(data.photos.devices).forEach((slots) => {
    slots.forEach((slot) => {
      totalSlots++;
      const slotPhotoCount = slot.images.length;
      devicePhotos += slotPhotoCount;
      if (slotPhotoCount > 0) {
        completedSlots++;
      }
    });
  });

  return {
    totalPhotos: generalPhotos + devicePhotos,
    generalPhotos,
    devicePhotos,
    completedSlots,
    totalSlots,
  };
}

// Validate submission requirements
export function validateSubmission(data) {
  const stats = getPhotoStats(data);

  // Require at least 1 general site photo
  if (stats.generalPhotos === 0) {
    return {
      valid: false,
      message: "Please add at least 1 general site photo before submitting.",
    };
  }

  // Require at least 1 device location photo
  if (stats.completedSlots === 0) {
    return {
      valid: false,
      message: "Please add at least 1 device location photo before submitting.",
    };
  }

  return { valid: true, message: "" };
}

// Convert data URL to File object for upload
export function dataUrlToFile(dataUrl, filename) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

// Default quote data for testing/fallback
export const defaultQuoteData = {
  quoteId: "QA-1001",
  customer: {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "0400 000 000",
    address: "123 Example Street, Sydney NSW 2000",
  },
  solution: "Alarm + CCTV",
  items: [
    { sku: "AJAX-HUB2-4G", name: "Ajax Hub 2 (4G)", qty: 1, desc: "Wireless alarm hub" },
    { sku: "AJAX-MD", name: "Motion Detector", qty: 3, desc: "PIR motion sensor" },
    { sku: "AJAX-DOOR", name: "Door/Window Contact", qty: 4, desc: "Magnetic reed switch" },
    { sku: "HK-4MP-DOME", name: "Hikvision 4MP Dome Camera", qty: 2, desc: "PoE dome camera" },
  ],
  photos: {
    general: [],
    devices: {
      "AJAX-HUB2-4G": [{ images: [], notes: "" }],
      "AJAX-MD": [
        { images: [], notes: "" },
        { images: [], notes: "" },
        { images: [], notes: "" },
      ],
      "AJAX-DOOR": [
        { images: [], notes: "" },
        { images: [], notes: "" },
        { images: [], notes: "" },
        { images: [], notes: "" },
      ],
      "HK-4MP-DOME": [
        { images: [], notes: "" },
        { images: [], notes: "" },
      ],
    },
  },
  submitted: false,
};
