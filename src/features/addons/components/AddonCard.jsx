import { Card, CardContent } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { CheckCircle, Eye, Package } from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/quote';

// helper to render plain text in cards (summary may contain HTML from Woo)
const stripHtml = (s) =>
  (s || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

const typeIcons = {
  sensor: Package,
  keypad: Package,
  controller: Package,
  psu: Package,
  expander: Package,
  accessory: Package
};

export function AddonCard({
  addon,
  context,
  selectedQuantity,
  isAutoAppended = false,
  onClick,
  className
}) {
  const Icon = typeIcons[addon.type];
  const price = addon.unitPrice[context];
  const isSelected = selectedQuantity > 0;

  // Clean, safe summary for the card (no HTML). Fallback to first bullet.
  const displayedSummary = stripHtml(addon.summary) || (addon.bullets?.[0] ?? '');

  return (
    <Card
      className={`
        relative cursor-pointer transition-all duration-200 hover:shadow-md
        ${isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : 'hover:border-primary/30'}
        ${isAutoAppended ? 'opacity-75 cursor-not-allowed' : ''}
        ${className || ''}
      `}
      onClick={isAutoAppended ? undefined : onClick}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-primary text-primary-foreground">
            {selectedQuantity > 1 ? `${selectedQuantity} Selected` : 'Selected'}
          </Badge>
        </div>
      )}

      {isAutoAppended && (
        <div className="absolute -top-2 -left-2 z-10">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Auto-added
          </Badge>
        </div>
      )}

      <CardContent className="!p-5 text-left">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm leading-tight">{addon.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {displayedSummary}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-primary border-primary/30 bg-primary/5"
            >
              {formatCurrency(price)}
            </Badge>

            {!isAutoAppended && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                <span>View details</span>
              </div>
            )}
          </div>

          {isSelected && !isAutoAppended && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Added to package
              </span>
            </div>
          )}

          {isAutoAppended && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Required for your selected configuration
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}