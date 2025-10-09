import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Switch } from '../../../shared/ui/switch';
import { Minus, Plus, CheckCircle2, Package, Play, HelpCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/quote';
import { SHOW_PRICE } from '../../../shared/config/flags';

export function AddonModal({
  addon,
  context,
  isOpen,
  currentQuantity,
  validation,
  onClose,
  onSave,
  showPrice
}) {
  const [quantity, setQuantity] = useState(currentQuantity);
  const [include, setInclude] = useState(currentQuantity > 0);
  const [incrementError, setIncrementError] = useState(null);

  // Sync local state when addon or currentQuantity changes
  useEffect(() => {
    setQuantity(currentQuantity);
    setInclude(currentQuantity > 0);
  }, [addon?.id, currentQuantity]);

  if (!addon) return null;

  const price = addon.unitPrice[context];
  const totalPrice = price * quantity;
  const shouldShowPrice = showPrice ?? SHOW_PRICE;

  const handleSave = () => {
    // Always save the current quantity (0 means remove)
    onSave(quantity, quantity > 0);
    onClose();
  };

  const incrementQuantity = () => {
    if (!addon) return;
    
    const canIncrement = validation.canIncrement(addon.id, quantity);
    if (canIncrement.allowed) {
      setQuantity(quantity + 1);
      if (!include) setInclude(true);
      setIncrementError(null);
    } else {
      setIncrementError(canIncrement.reason || 'Cannot increase quantity');
    }
  };

  const decrementQuantity = () => {
    if (!addon) return;
    
    if (quantity > addon.qtyMin) {
      setQuantity(quantity - 1);
      if (quantity - 1 === 0) setInclude(false);
      setIncrementError(null);
    }
  };

  const canIncrementResult = addon ? validation.canIncrement(addon.id, quantity) : { allowed: false };
  const isAtMaxQuantity = !canIncrementResult.allowed;
  const showMaxQuantityWarning = isAtMaxQuantity && incrementError;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{addon.name}</DialogTitle>
              {/* <p className="text-muted-foreground mt-1">{addon.summary}</p> */}
              {SHOW_PRICE ? (
                <Badge variant="outline" className="mt-2 text-primary border-primary/30">
                  {formatCurrency(price)} each
                </Badge>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="help">Do I Need This?</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Key Benefits</h3>
              <ul className="space-y-3">
                {addon.bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Technical Specifications</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {addon.consumesInput && (
                  <div>
                    <span className="text-muted-foreground">Uses Input Zone:</span>
                    <span className="ml-2 font-medium">Yes</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Power Draw:</span>
                  <span className="ml-2 font-medium">{addon.powerMilliAmps} mA</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium capitalize">{addon.type}</span>
                </div>
                {addon.isTouchscreen && (
                  <div>
                    <span className="text-muted-foreground">Touchscreen:</span>
                    <span className="ml-2 font-medium">Yes</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="help" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                When Should I Add This?
              </h3>
              
              <div className="space-y-4">
                {getHelpScenarios(addon.id).map((scenario, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{scenario.title}</h4>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary" />
                  Quick Video Guide
                </h4>
                <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Play className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">15-20s micro-video</p>
                    <p className="text-xs">(Coming soon)</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-6 space-y-4">
          {/* MOVE: Include toggle from footer to here - ABOVE quantity */}
          <div className="flex items-center justify-between">
            <label htmlFor="include-switch" className="text-sm font-medium">Include in my package</label>
            <Switch 
              id="include-switch"
              checked={include} 
              onCheckedChange={setInclude}
              aria-describedby="include-description"
            />
          </div>
          <p id="include-description" className="sr-only">
            Toggle to include or exclude this add-on from your package
          </p>

          {/* Existing quantity controls stay here */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Quantity {addon.qtyMax > 1 && <span className="text-xs text-muted-foreground">(max {addon.qtyMax})</span>}
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={decrementQuantity}
                disabled={quantity <= addon.qtyMin}
                aria-label={`Decrease quantity of ${addon.name}`}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center" aria-label={`Current quantity: ${quantity}`}>{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={incrementQuantity}
                disabled={isAtMaxQuantity}
                aria-label={`Increase quantity of ${addon.name}`}
                aria-describedby={incrementError ? 'quantity-error' : undefined}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showMaxQuantityWarning && (
            <div 
              id="quantity-error"
              className="bg-red-50 border border-red-200 rounded-lg p-3"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="text-sm text-red-800">
                  <strong>Cannot increase quantity:</strong> {incrementError}
                </p>
              </div>
            </div>
          )}

          {/* Footer - REMOVE the toggle from here since it's moved above */}
          <div className="space-y-4">
            {shouldShowPrice && include && quantity > 0 && (
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total for this item:</span>
                  <span className="font-semibold text-lg">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            )}

            <Button 
              onClick={handleSave} 
              className="w-full bg-primary hover:bg-primary-hover"
              size="lg"
            >
              Save Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getHelpScenarios(addonId) {
  const scenarios = {
    outpir: [
      {
        title: "Large Property with Yard Access",
        description: "If people can approach your house through gardens, driveways, or side passages, outdoor sensors provide early warning before they reach doors or windows."
      },
      {
        title: "Previous Break-in Attempts",
        description: "Properties that have experienced break-ins benefit from perimeter detection that alerts you to suspicious activity before entry is attempted."
      },
      {
        title: "You Have Outdoor Pets",
        description: "These sensors are specifically tuned to ignore cats and small dogs while still detecting human intruders."
      }
    ],
    smoke: [
      {
        title: "Multi-level Properties",
        description: "Smoke travels upward, so having detection on each level ensures rapid notification even if fire starts in basement or upstairs areas."
      },
      {
        title: "Remote Monitoring Important",
        description: "Unlike standalone smoke alarms, these integrate with your security system to send instant app notifications wherever you are."
      },
      {
        title: "Business or Rental Property",
        description: "Properties where you're not always present benefit from integrated fire detection that alerts you immediately."
      }
    ],
    tskp: [
      {
        title: "Multiple Users",
        description: "If family members, staff, or regular visitors use the system, touchscreens make arming/disarming much faster and less error-prone."
      },
      {
        title: "Elderly or Vision-Impaired Users",
        description: "Large, clear displays are much easier to read than small LED keypads, especially in low light conditions."
      },
      {
        title: "High-Traffic Entry Points",
        description: "Busy entrances benefit from one-touch operation rather than complex button sequences."
      }
    ]
  };

  return scenarios[addonId] || [
    {
      title: "Assess Your Specific Needs",
      description: "Consider your property layout, usage patterns, and security priorities when deciding on this add-on."
    }
  ];
}


