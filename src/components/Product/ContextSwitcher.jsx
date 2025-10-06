import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../shared/ui/accordion';
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

  return (
    <div className={`rounded-3xl overflow-hidden border border-primary/20 shadow-sm p-6 ${className || ''}`} style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.06), hsl(var(--secondary)/0.06))', borderRadius: '28px' }}>
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
                onClick={() => onContextChange(context)}
                className={`group neon-pop-3d relative h-28 w-44 rounded-full px-5 py-4 flex items-center justify-center gap-3
                  transition-all duration-300 ease-out
                  ${isActive ? 'translate-y-0' : 'translate-y-[2px]'}
                  ${isActive ? 'shadow-[0_14px_40px_-12px_rgba(20,184,166,0.45),inset_0_-4px_0_rgba(0,0,0,0.2)]' : 'shadow-[0_10px_28px_-12px_rgba(20,184,166,0.25),inset_0_-2px_0_rgba(233,30,99,0.15)]'}
                  ${isActive ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground' : 'bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 text-foreground'}
                  hover:translate-y-[-3px] hover:rounded-full hover:shadow-[0_22px_52px_-18px_rgba(20,184,166,0.55)]
                  active:translate-y-[1px] active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)]
                  border border-primary/30
                `}
                style={{
                  borderRadius: '9999px',
                  backgroundImage: isActive
                    ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 60%, hsl(var(--primary)/0.85) 100%)'
                    : 'linear-gradient(135deg, hsl(var(--primary)/0.12) 0%, hsl(var(--secondary)/0.12) 100%)'
                }}
              >
                {/* Left label + icon for Residential, right icon + label for Retail */}
                {context === 'residential' ? (
                  <>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>{contextLabels[context]}</span>
                    <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 ${isActive ? 'bg-primary/30 scale-105' : 'bg-primary/10 scale-100 group-hover:scale-105'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 ${isActive ? 'bg-primary/30 scale-105' : 'bg-primary/10 scale-100 group-hover:scale-105'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>{contextLabels[context]}</span>
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

        {/* Teal gradient accordion for price factors */}
        <Accordion type="single" collapsible className="rounded-2xl overflow-hidden">
          <AccordionItem value="price-factors" className="border-none">
            <AccordionTrigger className="px-4 py-3 bg-gradient-to-r from-accent/15 via-accent/20 to-accent/15 text-accent rounded-2xl hover:no-underline">
              <span className="font-medium">What could change this price?</span>
            </AccordionTrigger>
            <AccordionContent className="bg-gradient-to-br from-accent/10 via-accent/15 to-accent/10 rounded-b-2xl">
              <div className="mt-2 text-sm text-muted-foreground space-y-1 px-4">
                <p>• Long cable runs beyond included meters</p>
                <p>• Conduit installation in commercial properties</p>
                <p>• Heritage building or access restrictions</p>
                <p>• Roof type and accessibility challenges</p>
                <p>• Local council requirements</p>
                <p>• Site-specific installation complexity</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}