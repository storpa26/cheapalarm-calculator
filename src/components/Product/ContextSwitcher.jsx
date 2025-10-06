import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { useEffect, useRef, useState } from 'react';
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
  const [animatedContext, setAnimatedContext] = useState(null);
  const timerRef = useRef(null);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className={`rounded-2xl p-6 ${className || ''}`} style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.06), hsl(var(--secondary)/0.06))' }}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Property Type & Assumptions</h3>
        </div>

        <div className="flex justify-center gap-6">
          {contexts.map(context => {
            const Icon = contextIcons[context];
            const isActive = context === currentContext;
            
            return (
              <button
                key={context}
                onClick={(e) => {
                  if (context !== currentContext) {
                    onContextChange(context);
                    // Persist animation class via state for ~1.1s
                    setAnimatedContext(context);
                    if (timerRef.current) clearTimeout(timerRef.current);
                    timerRef.current = setTimeout(() => setAnimatedContext(null), 1150);
                  } else {
                    onContextChange(context);
                  }
                }}
                className={`group neon-ring ${animatedContext === context ? 'neon-animate' : ''} relative h-28 w-44 rounded-2xl px-5 py-4 flex items-center justify-center gap-3
                  transition-all duration-300 ease-out
                  ${isActive ? 'translate-y-0' : 'translate-y-[2px]'}
                  ${isActive ? 'shadow-[0_10px_30px_-10px_rgba(233,30,99,0.6),inset_0_-4px_0_rgba(0,0,0,0.2)]' : 'shadow-[0_8px_20px_-10px_rgba(233,30,99,0.25),inset_0_-2px_0_rgba(233,30,99,0.15)]'}
                  ${isActive ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground' : 'bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 text-foreground'}
                  hover:translate-y-[-2px] hover:ring-2 hover:ring-primary/40 hover:rounded-2xl
                  active:translate-y-[1px] active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)]
                  border border-primary/30
                `}
                style={{
                  backgroundImage: isActive
                    ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 60%, hsl(var(--primary)/0.85) 100%)'
                    : 'linear-gradient(135deg, hsl(var(--primary)/0.12) 0%, hsl(var(--secondary)/0.12) 100%)'
                }}
              >
                {/* Left label + icon for Residential, right icon + label for Retail */}
                {context === 'residential' ? (
                  <>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-primary-foreground drop-shadow-sm' : 'text-foreground'}`}>{contextLabels[context]}</span>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 ${isActive ? 'bg-primary/30 scale-105' : 'bg-primary/10 scale-100 group-hover:scale-105'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 ${isActive ? 'bg-primary/30 scale-105' : 'bg-primary/10 scale-100 group-hover:scale-105'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-primary-foreground drop-shadow-sm' : 'text-foreground'}`}>{contextLabels[context]}</span>
                  </>
                )}
                {/* Hover ring respects rounded corners via Tailwind ring and rounded-2xl */}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Current Assumptions:</h4>
          <div className="flex flex-wrap gap-2">
            {(assumptions || defaultChips[currentContext] || []).map((assumption, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-primary/5 border-primary/30 text-primary">
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