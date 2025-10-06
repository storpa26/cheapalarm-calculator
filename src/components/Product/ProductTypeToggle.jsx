import { useState } from 'react';

export function ProductTypeToggle({ value, onChange, className }) {
  return (
    <div className={`flex justify-center mb-8 ${className || ''}`}>
      <div className="bg-background border rounded-xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:shadow-primary/20">
        <div className="flex bg-muted rounded-lg p-1 gap-1">
          <button
            onClick={() => onChange('wireless')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 relative overflow-hidden hover:scale-105 active:scale-95 ${
              value === 'wireless'
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <span className="relative z-10">Wireless</span>
            {value === 'wireless' && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary animate-pulse" />
            )}
          </button>
          
          <button
            onClick={() => onChange('hardwired')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 relative overflow-hidden hover:scale-105 active:scale-95 ${
              value === 'hardwired'
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <span className="relative z-10">Hardwired</span>
            {value === 'hardwired' && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}