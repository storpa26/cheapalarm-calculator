import React, { createContext, useContext, useState } from 'react';
import { X } from 'lucide-react';

const DialogContext = createContext();

const Dialog = ({ children, open, onOpenChange }) => {
  // Support both controlled and uncontrolled usage
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);

  const computedOpen = isControlled ? !!open : internalOpen;

  const handleOpenChange = (newOpen) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    if (onOpenChange) onOpenChange(newOpen);
  };

  return (
    <DialogContext.Provider value={{ isOpen: computedOpen, setIsOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = ({ children, asChild, ...props }) => {
  const { setIsOpen } = useContext(DialogContext);
  
  const handleClick = () => {
    setIsOpen(true);
  };
  
  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick, ...props });
  }
  
  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

const DialogContent = React.forwardRef(({ 
  className = '', 
  children, 
  ...props 
}, ref) => {
  const { isOpen, setIsOpen } = useContext(DialogContext);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div
        ref={ref}
        className={`modal-surface text-white relative rounded-3xl overflow-hidden border border-primary/20 shadow-xl max-w-lg w-full max-h-[85vh] overflow-auto p-6 ${className}`}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)/0.06), hsl(var(--secondary)/0.06))',
          borderRadius: '28px'
        }}
        {...props}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
});

DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className = '', ...props }) => (
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0 ${className}`}
    {...props}
  />
);

const DialogTitle = React.forwardRef(({ className = '', ...props }, ref) => (
  <h2
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));

DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef(({ className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground ${className}`}
    {...props}
  />
));

DialogDescription.displayName = 'DialogDescription';

export { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
};