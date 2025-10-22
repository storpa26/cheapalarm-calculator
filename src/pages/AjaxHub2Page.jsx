import { useState, useCallback } from 'react';
// Replace dynamic Woo add-ons with static dummy section
import AjaxHub2DummySection from '../components/AjaxHub2DummySection';
import { LeadCaptureForm } from '../components/Product/LeadCaptureForm.tsx';
import { SHOW_PRICE } from '../shared/config/flags';
import { StickyCartBar } from '../widgets/sticky-cart/StickyCartBar';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { ListChecks } from 'lucide-react';
import { addons as staticAddons } from '../data/ajaxHub2';

export default function AjaxHub2Page() {
  // Reuse existing calculator flow; WordPress content plugs in later
  const [productType, setProductType] = useState('wireless');
  const [context] = useState('residential');
  const [selectedAddons, setSelectedAddons] = useState([]);
  // No pricing: keep only selections
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const handleTotalsChange = useCallback((addons, total) => {
    setSelectedAddons(addons);
    setEstimatedTotal(total);
  }, []);

  // No Woo products in dummy mode

  const handleAddToQuote = () => {
    setShowLeadForm(true);
  };

  const handleLeadSubmit = async (leadData) => {
    setIsSubmittingLead(true);
    try {
      console.log('Lead submitted:', leadData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Thank you! Your quote request has been submitted successfully.');
      setShowLeadForm(false);
    } catch (error) {
      console.error('Failed to submit lead:', error);
      alert('Sorry, there was an error submitting your request. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-3xl font-bold text-center mb-2">
            AJAX Hub 2 Configurator
          </h1>
          <p className="text-lg text-muted-foreground text-center">
            Build your Ajax system: add devices and see live totals
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {/* Property Type removed per Ajax Hub 2 policy */}

        {/* Dummy Add-ons Section with Right Rail Total */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Add-Ons & Upgrades</h2>
              <p className="text-muted-foreground">Customize your security system with additional sensors and features</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AjaxHub2DummySection
                  context={context}
                  onTotalsChange={handleTotalsChange}
                />
              </div>
              <div className="lg:col-span-1 space-y-6">
                {/* Selected Items Summary (no prices) */}
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-primary" />
                      Selected Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="font-medium">Selected Add-ons:</div>
                      {selectedAddons.length === 0 && (
                        <div className="text-xs text-muted-foreground">No add-ons selected yet.</div>
                      )}
                      {selectedAddons.map((selection) => {
                        const addon = staticAddons.find(a => a.id === selection.id);
                        if (!addon) return null;
                        return (
                          <div key={selection.id} className="flex justify-between text-xs pl-2">
                            <span>{addon.name}</span>
                            <span>Qty: {selection.quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Capture Form */}
        {showLeadForm && (
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto max-w-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Get Your Quote</h2>
                <p className="text-muted-foreground">
                  Enter your details to receive a personalized quote
                </p>
              </div>
              <LeadCaptureForm
                onSubmit={handleLeadSubmit}
                isLoading={isSubmittingLead}
                productContext={{
                  productType,
                  context,
                  selectedAddons: selectedAddons.map(addon => addon.id),
                  estimatedTotal,
                  productName: 'AJAX Hub 2 System'
                }}
                propertyContext={{
                  propertyType: context,
                  buildingType: 'standard'
                }}
                showPrice={SHOW_PRICE}
              />
            </div>
          </section>
        )}
      </main>

      {/* Sticky Cart Bar */}
      <StickyCartBar
        selectedAddons={selectedAddons.map(s => ({ id: s.id, quantity: s.quantity }))}
        estimatedTotal={0}
        onAddToCart={handleAddToQuote}
        context={context}
        productType={productType}
        showPrice={SHOW_PRICE}
        hideContextBadge={true}
      />
    </div>
  );
}