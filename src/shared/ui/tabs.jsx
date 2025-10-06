import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

const Tabs = ({ defaultValue, value, onValueChange, children, className = '', ...props }) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue);
  
  const handleValueChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) onValueChange(newValue);
  };
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleValueChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
    {...props}
  />
));

TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef(({ 
  className = '', 
  value, 
  children, 
  ...props 
}, ref) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? 'bg-background text-foreground shadow-sm' 
          : 'hover:bg-background/50'
      } ${className}`}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
});

TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef(({ 
  className = '', 
  value, 
  children, 
  ...props 
}, ref) => {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) return null;
  
  return (
    <div
      ref={ref}
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };