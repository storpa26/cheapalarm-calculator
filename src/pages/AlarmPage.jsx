import { useState, useCallback, useRef } from 'react';
import { ContextSwitcher } from '../components/Product/ContextSwitcher';
import { AddOnsSection } from '../components/Product/AddOnsSection';
import { LeadCaptureForm } from '../components/Product/LeadCaptureForm';
import { StickyCartBar } from '../widgets/sticky-cart/StickyCartBar';
import { SHOW_PRICE } from '../shared/config/flags';

export default function AlarmPage() {
  const [productType, setProductType] = useState('wireless');
  const [context, setContext] = useState('residential');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [addonProducts, setAddonProducts] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState(null);
  const addOnsRef = useRef(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const handleAddonsUpdate = (addons) => {
    setSelectedAddons(addons);
    
    // Calculate estimated total
    const total = addons.reduce((sum, addon) => {
      const addonProduct = addonProducts.find(p => p.id === addon.id);
      if (addonProduct) {
        const price = typeof addonProduct.unitPrice === 'object' 
          ? addonProduct.unitPrice[context] || 0 
          : addonProduct.unitPrice || 0;
        return sum + (price * addon.qty);
      }
      return sum;
    }, 0);
    
    setEstimatedTotal(total);
  };

  const handleAddonProductsChange = useCallback((products) => {
    setAddonProducts(products);
  }, []);

  const handleAddToQuote = () => {
    setShowLeadForm(true);
  };

  const handleLeadSubmit = async (data) => {
    setIsSubmittingLead(true);
    try {
      setLeadData(data);
      setShowLeadForm(false);
      setTimeout(() => {
        const el = addOnsRef.current;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (error) {
      console.error('Failed to handle lead submit:', error);
      alert('Sorry, there was an error. Please try again.');
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
            Cheap Alarm System Configurator
          </h1>
          <p className="text-lg text-muted-foreground text-center">
            Design your perfect security system with our interactive configurator
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {/* Product Type Selection removed per request (quiz will decide later) */}

        {/* Context Selection */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Property Type</h2>
              <p className="text-muted-foreground">
                Tell us about your property to get accurate pricing
              </p>
            </div>
            <div className="flex justify-center">
              <ContextSwitcher 
                currentContext={context} 
                onContextChange={setContext} 
              />
            </div>
          </div>
        </section>

        {/* Add-ons Section (gated) */}
        {leadData ? (
          <div ref={addOnsRef}>
            <AddOnsSection
              context={context}
              productType={productType}
              selectedAddons={selectedAddons}
              onUpdateAddons={handleAddonsUpdate}
              onAddonProductsChange={handleAddonProductsChange}
              estimatedTotal={estimatedTotal}
              onAddToQuote={handleAddToQuote}
              showPrice={!SHOW_PRICE}
            />
          </div>
        ) : (
          <section className="py-8 px-4">
            <div className="container mx-auto max-w-6xl text-center">
              <div className="inline-block bg-muted/30 border rounded-lg px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Start by requesting your quote. We’ll unlock add-ons after.
                </p>
              </div>
            </div>
          </section>
        )}

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
                  productName: `${productType.charAt(0).toUpperCase() + productType.slice(1)} Alarm System`
                }}
                propertyContext={{
                  propertyType: context,
                  buildingType: 'standard'
                }}
                showPrice={!SHOW_PRICE}
              />
            </div>
          </section>
        )}
      </main>

      {/* Sticky Cart Bar */}
      <StickyCartBar
        selectedAddons={selectedAddons}
        estimatedTotal={estimatedTotal}
        onAddToCart={handleAddToQuote}
        context={context}
        productType={productType}
        showPrice={!SHOW_PRICE}
      />
    </div>
  );
}