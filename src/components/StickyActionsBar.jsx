import { Button } from '../shared/ui/button';
import { Save, Upload, Loader2 } from 'lucide-react';

// Sticky actions bar component for save and submit actions
// Fixed at bottom of page for easy access during photo upload process
export function StickyActionsBar({ onSave, onSubmit, isSaving, isSubmitting }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/40 shadow-elevated z-50">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-muted-foreground font-medium text-center sm:text-left">
            Save your progress regularly. Submit when you're ready to finalize your quote.
          </p>
          
          <div className="flex gap-4 justify-center sm:justify-end">
            {/* Save Progress Button */}
            <Button
              variant="outline"
              onClick={onSave}
              disabled={isSaving || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium border-border/40 hover:border-primary/60 hover:text-primary transition-colors"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Progress'}
            </Button>

            {/* Submit Photos Button */}
            <Button
              onClick={onSubmit}
              disabled={isSaving || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Photos'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
