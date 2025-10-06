import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { Settings, Home, Store } from 'lucide-react';

const contextLabels = {
  residential: 'Residential',
  retail: 'Small Retail'
};

const defaultChips = {
  residential: ['≤200 m²', 'Single storey', 'Avg run 15–20 m'],
  retail: ['≤300 m²', 'Ground floor', 'Avg run 20–25 m']
};

const contextIcons = {
  residential: Home,
  retail: Store
};

export function ContextSwitcher({ 
  currentContext, 
  onContextChange, 
  assumptions,
  className 
}) {
  const contexts = ['residential', 'retail'];

  return (
    <div className={`bg-muted/30 rounded-lg p-6 ${className || ''}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Property Type & Assumptions</h3>
        </div>

        <div className="flex justify-center gap-3">
          {contexts.map(context => {
            const Icon = contextIcons[context];
            const isActive = context === currentContext;
            
            return (
              <Button
                key={context}
                variant={isActive ? "default" : "outline"}
                className={`
                  h-24 w-24 flex-col gap-2 p-4
                  ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/5'}
                `}
                onClick={() => onContextChange(context)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium text-center leading-tight">{contextLabels[context]}</span>
              </Button>
            );
          })}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Current Assumptions:</h4>
          <div className="flex flex-wrap gap-2">
            {(assumptions || defaultChips[currentContext] || []).map((assumption, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {assumption}
              </Badge>
            ))}
          </div>
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-primary font-medium hover:underline">
            What could change this price?
          </summary>
          <div className="mt-2 text-muted-foreground space-y-1">
            <p>• Long cable runs beyond included meters</p>
            <p>• Conduit installation in commercial properties</p>
            <p>• Heritage building or access restrictions</p>
            <p>• Roof type and accessibility challenges</p>
            <p>• Local council requirements</p>
            <p>• Site-specific installation complexity</p>
          </div>
        </details>
      </div>
    </div>
  );
}