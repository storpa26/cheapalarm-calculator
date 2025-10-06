// Rules engine for alarm system validation
export class RulesEngine {
  constructor(addonProducts = [], baseProductPrice = 0) {
    this.addonProducts = addonProducts;
    this.baseProductPrice = baseProductPrice;
  }

  validateSelection(selectedAddons) {
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

  getCapacityLimits(selectedAddons) {
    return {
      inputs: { used: 0, max: 16, threshold: 8 },
      power: { used: 0, max: 1000 },
      keypads: { used: 0, max: 8 },
      touchscreens: { used: 0, max: 4, threshold: 0 }
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