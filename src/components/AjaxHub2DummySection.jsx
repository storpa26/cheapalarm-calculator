import { useMemo, useState, useCallback, useEffect } from 'react';
import { addons } from '../data/ajaxHub2';
import { CapacityMeter } from '../widgets/capacity-meter/CapacityMeter';
import { RulesEngine } from '../lib/rules';

export default function AjaxHub2DummySection({ context, onTotalsChange }) {
  // Map static dataset into RulesEngine-compatible addonProducts
  const addonProducts = useMemo(() =>
    addons.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type === 'touchscreen' ? 'keypad' : a.type, // treat touchscreen as keypad for capacity
      isTouchscreen: a.type === 'touchscreen',
      consumesInput: a.type === 'input',
      powerMilliAmps: 0,
      qtyMax: a.maxPerSystem,
      unitPrice: { residential: a.price, smallRetail: a.price }
    })),
  []);

  const rules = useMemo(() => new RulesEngine(addonProducts, { residential: 0, smallRetail: 0 }), [addonProducts]);

  const [selectedAddons, setSelectedAddons] = useState([]); // array of { id, quantity }

  const selectionMap = useMemo(() => new Map(selectedAddons.map(s => [s.id, s.quantity])), [selectedAddons]);

  const validation = useMemo(() => rules.validateSelection(selectedAddons), [rules, selectedAddons]);
  const limits = useMemo(() => validation.capacityLimits, [validation]);
  const violations = useMemo(() => validation.violations || [], [validation]);

  const total = useMemo(() => rules.calculateTotal(selectedAddons, context), [rules, selectedAddons, context]);

  const toggleAddon = useCallback((addon) => {
    const currentQty = selectionMap.get(addon.id) || 0;
    if (currentQty === 0) {
      const can = validation.canIncrement(addon.id, currentQty);
      if (!can.allowed) return; // silently block in dummy UI
      setSelectedAddons(prev => [...prev, { id: addon.id, quantity: 1 }]);
    } else {
      setSelectedAddons(prev => prev.filter(s => s.id !== addon.id));
    }
  }, [selectionMap, validation]);

  // Emit totals and selection to parent after render
  useEffect(() => {
    onTotalsChange?.(selectedAddons, total);
  }, [selectedAddons, total, onTotalsChange]);

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Add-Ons & Upgrades</h2>
          <p className="text-muted-foreground">Select the sensors and features you need</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {addons.map((a) => {
            const isSelected = (selectionMap.get(a.id) || 0) > 0;
            return (
              <button
                key={a.id}
                onClick={() => toggleAddon(a)}
                className={`text-left rounded-lg border p-4 transition ${isSelected ? 'bg-primary/5 border-primary/30' : 'bg-background'}`}
              >
                <div className="font-semibold text-sm">{a.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{a.description}</div>
                {/* No price display per policy */}
                <div className="mt-2 text-muted-foreground text-xs">Pricing provided after review</div>
                <div className="mt-1 text-xs text-muted-foreground">Tap to {isSelected ? 'remove' : 'add'}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <CapacityMeter limits={limits} violations={violations} />
        </div>
      </div>
    </section>
  );
}