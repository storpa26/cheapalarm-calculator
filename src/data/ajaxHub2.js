export const propertyContexts = [
  {
    id: 'residential',
    name: 'Residential',
    assumptions: ['<200 m²', 'Single storey', 'Avg run 15–20 m'],
    basePrice: 0,
  },
  {
    id: 'smallRetail',
    name: 'Small Retail',
    assumptions: ['<300 m²', 'Mixed entry points'],
    basePrice: 0,
  },
];

export const addons = [
  {
    id: 'panic_button',
    name: 'Panic button (portable)',
    price: 55,
    type: 'input',
    description:
      'Instant silent alert to monitoring. Small and discreet portable panic.',
    maxPerSystem: 20,
  },
  {
    id: 'glass_break',
    name: 'Glass break detector',
    price: 160,
    type: 'input',
    description:
      'Covers multiple windows per sensor. No false alarms from normal noise.',
    maxPerSystem: 30,
  },
  {
    id: 'door_window',
    name: 'Door/window sensor',
    price: 95,
    type: 'input',
    description:
      'Immediate notification of entry. Battery lasts 3+ years.',
    maxPerSystem: 30,
  },
  {
    id: 'keypad',
    name: 'Additional keypad',
    price: 165,
    type: 'keypad',
    description:
      'Multiple convenient locations. Staff can have separate codes.',
    maxPerSystem: 10,
  },
  {
    id: 'touchscreen',
    name: 'Touchscreen keypad',
    price: 250,
    type: 'touchscreen',
    description:
      'One-tap arming and disarming. Perfect for guest access.',
    maxPerSystem: 5,
  },
  {
    id: 'outdoor_motion_pet',
    name: 'Outdoor motion sensor (pet friendly)',
    price: 265,
    type: 'input',
    description:
      'Reduces false alarms from outdoor pets. Great for yards.',
    maxPerSystem: 15,
  },
];

export const ajaxLimits = {
  INPUT_LIMIT: 100,
  POWER_BUDGET_MA: 1000,
  MAX_KEYPADS: 10,
  MAX_TOUCHSCREENS: 5,
};