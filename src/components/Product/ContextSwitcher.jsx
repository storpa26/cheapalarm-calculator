import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../shared/ui/accordion';
import { Card, CardContent } from '../../shared/ui/card';
import { useEffect, useRef, useState } from 'react';
import { Settings, Home, Store, Building2 } from 'lucide-react';

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
  className,
  storeyType,
  onStoreyTypeChange
}) {
  const contexts = ['residential', 'retail'];

  // Building type options (matches screenshot style)
  const storeyOptions = [
    {
      type: 'single',
      label: 'Single Storey',
      description: 'One level with pitched/tiled roof',
      icon: Home,
      recommended: 'Hardwired System'
    },
    {
      type: 'multi',
      label: 'Multi Storey',
      description: 'Two or more levels',
      icon: Building2,
      recommended: 'Wireless System'
    }
  ];

  // Compute assumption chips with storey type reflected for mobile clarity
  const baseChips = (assumptions || defaultChips[currentContext] || []).slice();
  let computedChips = baseChips;
  if (currentContext === 'residential') {
    const idx = computedChips.findIndex(c => c.toLowerCase().includes('storey'));
    if (idx !== -1) computedChips[idx] = storeyType === 'multi' ? 'Multi storey' : 'Single storey';
    else computedChips.push(storeyType === 'multi' ? 'Multi storey' : 'Single storey');
  } else {
    const idx = computedChips.findIndex(c => c.toLowerCase().includes('storey') || c.toLowerCase().includes('ground floor'));
    if (idx !== -1) computedChips[idx] = storeyType === 'multi' ? 'Multi storey' : 'Ground floor';
    else computedChips.push(storeyType === 'multi' ? 'Multi storey' : 'Ground floor');
  }

  return (
    <div className={`rounded-3xl overflow-hidden border border-primary/20 shadow-sm p-6 ${className || ''}`} style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.06), hsl(var(--secondary)/0.06))', borderRadius: '28px' }}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Property Type & Assumptions</h3>
        </div>

        {/* Context selector */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {contexts.map(context => {
            const Icon = contextIcons[context];
            const isActive = context === currentContext;
            
            return (
              <button
                key={context}
                onClick={() => onContextChange(context)}
                className={`group neon-pop-3d relative h-16 md:h-20 w-44 md:w-52 rounded-full py-0 px-5 flex items-center justify-between gap-3
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
                    <span className={`flex-1 block text-sm font-semibold py-2 md:py-3 relative z-10 transition-colors duration-300 ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>{contextLabels[context]}</span>
                    <div className={`h-full w-16 md:w-20 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 pointer-events-none flex-none -mr-5 md:-mr-6 ${isActive ? 'bg-primary/30 scale-105' : 'bg-primary/10 scale-100 group-hover:scale-105'}`}>
                      <Icon className="w-2/3 h-2/3" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`h-full w-16 md:w-20 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 pointer-events-none flex-none -ml-5 md:-ml-6 ${isActive ? 'bg-primary/30 scale-105' : 'bg-primary/10 scale-100 group-hover:scale-105'}`}>
                      <Icon className="w-2/3 h-2/3" />
                    </div>
                    <span className={`flex-1 block text-sm font-semibold py-2 md:py-3 relative z-10 transition-colors duration-300 ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>{contextLabels[context]}</span>
                  </>
                )}
                {/* Hover ring respects rounded corners via Tailwind ring and rounded-2xl */}
              </button>
            );
          })}
        </div>

        {/* Building type selector cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {storeyOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = storeyType === option.type;
            return (
              <Card
                key={option.type}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onStoreyTypeChange && onStoreyTypeChange(option.type)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-3 rounded-full ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{option.label}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {option.recommended}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className={`${isSelected ? 'bg-primary hover:bg-primary-hover text-primary-foreground' : 'bg-primary/20 hover:bg-primary/30 text-primary'} w-full`}
                      onClick={(e) => { e.stopPropagation(); onStoreyTypeChange && onStoreyTypeChange(option.type); }}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mobile-friendly quick buttons */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          <Button
            className={`${storeyType === 'single' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'} rounded-full py-3`}
            onClick={() => onStoreyTypeChange && onStoreyTypeChange('single')}
          >
            Single Storey
          </Button>
          <Button
            className={`${storeyType === 'multi' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'} rounded-full py-3`}
            onClick={() => onStoreyTypeChange && onStoreyTypeChange('multi')}
          >
            Multi Storey
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Current Assumptions:</h4>
          <div className="flex flex-wrap gap-2">
            {computedChips.map((assumption, index) => (
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
