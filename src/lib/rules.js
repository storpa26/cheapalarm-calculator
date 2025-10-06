// Rules engine for alarm system validation
export class RulesEngine {
  constructor(addonProducts = [], baseProductPrice = 0) {
    this.addonProducts = addonProducts;
    this.baseProductPrice = baseProductPrice;
  }

  validateSelection(selectedAddons) {
    const limits = this.getCapacityLimits(selectedAddons);
    const selectionMap = new Map(selectedAddons.map(s => [s.id, s.quantity]));

    const canIncrement = (addonId, currentQuantity = 0) => {
      const addon = this.addonProducts.find(a => a.id === addonId);
      if (!addon) return { allowed: false, reason: 'Unknown item' };

      // Per-item max check
      const nextQty = currentQuantity + 1;
      if (typeof addon.qtyMax === 'number' && nextQty > addon.qtyMax) {
        return { allowed: false, reason: `Maximum ${addon.qtyMax} allowed for this item` };
      }

      // Inputs capacity check
      if (addon.consumesInput) {
        const usedInputs = limits.inputs.used;
        if (usedInputs + 1 > limits.inputs.max) {
          return { allowed: false, reason: 'No input zones remaining' };
        }
      }

      // Keypads capacity check (includes touchscreen as keypad)
      const isKeypad = addon.type === 'keypad' || addon.isTouchscreen === true;
      if (isKeypad) {
        const usedKeypads = limits.keypads.used;
        if (usedKeypads + 1 > limits.keypads.max) {
          return { allowed: false, reason: 'Maximum keypads reached' };
        }
      }

      // Power budget check
      const usedPower = limits.power.used;
      const nextPower = usedPower + (addon.powerMilliAmps || 0);
      if (nextPower > limits.power.max) {
        return { allowed: false, reason: 'Power budget exceeded' };
      }

      return { allowed: true };
    };

    return {
      isValid: true,
      violations: [],
      autoAppendedItems: [],
      capacityLimits: limits,
      canIncrement
    };
  }

  getCapacityLimits(selectedAddons) {
    const INPUT_LIMIT = 16;
    const INPUT_EXPANDER_THRESHOLD = 8; // when exceeding, expander may be required
    const POWER_BUDGET_MA = 1000;
    const MAX_KEYPADS = 8;
    const MAX_TOUCHSCREENS = 4;

    let inputsUsed = 0;
    let powerUsed = 0;
    let keypadsUsed = 0;
    let touchscreensUsed = 0;

    selectedAddons.forEach(({ id, quantity }) => {
      const addon = this.addonProducts.find(a => a.id === id);
      if (!addon) return;
      const qty = Number(quantity) || 0;

      if (addon.consumesInput) inputsUsed += qty;
      powerUsed += (addon.powerMilliAmps || 0) * qty;
      if (addon.type === 'keypad') keypadsUsed += qty;
      if (addon.isTouchscreen === true) touchscreensUsed += qty;
    });

    return {
      inputs: { used: inputsUsed, max: INPUT_LIMIT, threshold: INPUT_EXPANDER_THRESHOLD },
      power: { used: powerUsed, max: POWER_BUDGET_MA },
      keypads: { used: keypadsUsed, max: MAX_KEYPADS },
      touchscreens: { used: touchscreensUsed, max: MAX_TOUCHSCREENS, threshold: 0 }
    };
  }

  calculateTotal(selectedAddons, context) {
    // Handle baseProductPrice being either a number or an object with context properties
    let basePrice = 0;
    if (typeof this.baseProductPrice === 'number') {
      basePrice = this.baseProductPrice;
    } else if (this.baseProductPrice && typeof this.baseProductPrice === 'object') {
      basePrice = this.baseProductPrice[context] || this.baseProductPrice.residential || 0;
    }
    
    let total = basePrice;
    
    selectedAddons.forEach(selected => {
      const addon = this.addonProducts.find(a => a.id === selected.id);
      if (addon && addon.unitPrice && addon.unitPrice[context]) {
        total += addon.unitPrice[context] * selected.quantity;
      }
    });
    
    return total;
  }

  static validate(selectedAddons, context) {
    return {
      isValid: true,
      violations: [],
      autoAppendedItems: [],
      capacityLimits: {
        inputs: { used: 0, max: 16 },
        power: { used: 0, max: 1000 },
        keypads: { used: 0, max: 8 }
      }
    };
  }
}

export class SelectedAddon {
  constructor(id, quantity = 1) {
    this.id = id;
    this.quantity = quantity;
  }
}