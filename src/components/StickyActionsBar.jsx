import { Button } from '../shared/ui/button';
import { Upload, Loader2 } from 'lucide-react';

// Sticky actions bar component for submit action
// Fixed at bottom of page for easy access during photo upload process
export function StickyActionsBar({ onSubmit, isSubmitting }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: 9999,
      isolation: 'isolate', // Create new stacking context
      padding: '24px 0'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px', 
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            margin: '0',
            fontWeight: '500'
          }}>
            Submit when you're ready to finalize your quote.
          </p>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {/* Submit Photos Button */}
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              style={{
                backgroundColor: '#c95375',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ffffff',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                opacity: isSubmitting ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#b8456a';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#c95375';
                  e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              {isSubmitting ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Upload style={{ width: '16px', height: '16px' }} />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Photos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
