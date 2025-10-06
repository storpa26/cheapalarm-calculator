import { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { ShoppingCart, Loader2 } from 'lucide-react';

// Simple currency formatter
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  }).format(amount);
};

export function StickyCartBar({
  estimatedTotal,
  selectedAddons,
  context,
  basePrice,
  onAddToCart,
  className = ''
}) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Always include base product (1) + addon quantities
  const totalItems = 1 + (selectedAddons || []).reduce((sum, addon) => sum + addon.quantity, 0);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await onAddToCart();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 ${className}`}>
      <div className="container mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Cart Summary */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {context === 'residential' ? 'Residential' : 'Small Retail'} Package
              </Badge>
            </div>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {formatCurrency(estimatedTotal || 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                Total installed
              </div>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              disabled={isLoading}
              size="lg"
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}