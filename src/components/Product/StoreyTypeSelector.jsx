import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Building2 } from 'lucide-react';

export function StoreyTypeSelector({ value, onChange }) {
  const options = [
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

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          What type of building is this?
        </h3>
        <p className="text-sm text-muted-foreground">
          This helps us recommend the best alarm system for your property
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.type;
          
          return (
            <Card 
              key={option.type}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onChange(option.type)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {option.label}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {option.description}
                    </p>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {option.recommended}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <Button size="sm" className="w-full">
                      Selected
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}