// Placeholder addon data for the alarm configurator
export const addons = [
  {
    id: "outpir",
    name: "Outdoor motion sensor (pet friendly)",
    type: "sensor",
    consumesInput: true,
    powerMilliAmps: 25,
    unitPrice: { residential: 195, retail: 225 },
    summary: "Watches the outside before a break-in; tuned to ignore small pets.",
    bullets: [
      "Reduces false alarms from outdoor pets",
      "Great for driveways and backyards",
      "Deters intruders before they enter"
    ],
    qtyMin: 0,
    qtyMax: 8
  },
  {
    id: "tskp",
    name: "Touchscreen keypad",
    type: "keypad",
    consumesInput: false,
    powerMilliAmps: 90,
    unitPrice: { residential: 250, retail: 280 },
    summary: "Larger, clearer entry display for quick arm/disarm.",
    bullets: [
      "One-tap arming and disarming",
      "Perfect for guests and staff use",
      "Keep standard keypad as backup"
    ],
    qtyMin: 0,
    qtyMax: 4,
    isTouchscreen: true
  },
  {
    id: "smoke",
    name: "Wireless smoke detector",
    type: "sensor",
    consumesInput: true,
    powerMilliAmps: 15,
    unitPrice: { residential: 180, retail: 200 },
    summary: "Early fire detection with wireless connectivity.",
    bullets: [
      "10-year battery life",
      "Interconnected with other smoke detectors",
      "Meets Australian standards"
    ],
    qtyMin: 0,
    qtyMax: 10
  }
];