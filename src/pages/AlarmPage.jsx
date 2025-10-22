import { useState, useCallback, useRef } from 'react';
import { ContextSwitcher } from '../components/Product/ContextSwitcher';
import { AddOnsSection } from '../components/Product/AddOnsSection';
import { LeadCaptureForm } from '../components/Product/LeadCaptureForm.tsx';
import { StickyCartBar } from '../widgets/sticky-cart/StickyCartBar';
import { SHOW_PRICE } from '../shared/config/flags';
import { addons as staticAddons } from '../data/addons';

export default function AlarmPage() {
  const [productType, setProductType] = useState('wireless');
  const [context, setContext] = useState('residential');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [addonProducts, setAddonProducts] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [showLeadForm, setShowLeadForm] = useState(true); // Always show form
  const [leadData, setLeadData] = useState(null);
  const [formData, setFormData] = useState(null); // Store form data without submission
  const addOnsRef = useRef(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isCreatingEstimate, setIsCreatingEstimate] = useState(false);

  const handleAddonsUpdate = (addons) => {
    setSelectedAddons(addons);
    
    // Calculate estimated total with proper validation
    const total = addons.reduce((sum, addon) => {
      const addonProduct = addonProducts.find(p => p.id === addon.id);
      if (addonProduct) {
        const price = typeof addonProduct.unitPrice === 'object' 
          ? addonProduct.unitPrice[context] || 0 
          : addonProduct.unitPrice || 0;
        const quantity = addon.qty || addon.quantity || 1;
        const itemTotal = (price * quantity) || 0;
        return sum + itemTotal;
      }
      return sum;
    }, 0);
    
    // Ensure total is a valid number
    const validTotal = isNaN(total) ? 0 : total;
    setEstimatedTotal(validTotal);
  };

  const handleAddonProductsChange = useCallback((products) => {
    setAddonProducts(products);
  }, []);

  const handleAddToQuote = async () => {
    if (!formData) {
      alert('Please fill out the form first to get your quote.');
      return;
    }

    setIsCreatingEstimate(true);
    try {
      // Import the GHL API function
      const { createDraftDocument } = await import('../lib/ghl-api');
      
      // Create the payload with form data and current cart
      const payload = {
        ...formData,
        productContext: {
          productType,
          context,
          selectedAddons: selectedAddons.map(addon => addon.id),
          estimatedTotal,
          productName: `${productType.charAt(0).toUpperCase() + productType.slice(1)} Alarm System`,
          cart: buildCartFromSelectedAddons(selectedAddons, context, productType)
        },
        propertyContext: {
          propertyType: context,
          buildingType: 'standard'
        }
      };

      // Debug logging
      console.log('=== DEBUG: handleAddToQuote payload ===');
      console.log('formData:', formData);
      console.log('productType:', productType);
      console.log('context:', context);
      console.log('selectedAddons:', selectedAddons);
      console.log('estimatedTotal:', estimatedTotal);
      console.log('cart:', payload.productContext.cart);
      console.log('Full payload:', payload);

      // Create draft estimate
      const result = await createDraftDocument(payload, 'estimate');
      
      if (result.success) {
        const isGHLDisabled = import.meta.env.VITE_DISABLE_GHL_INTEGRATION === 'true';
        let message = isGHLDisabled 
          ? '🔧 Development Mode: Draft estimate created successfully (GHL integration disabled)'
          : `🎉 Thank you! We've created your estimate and will review it shortly. You'll receive your personalized quote within 24 hours.`;
        
        alert(message);
        
        // Scroll to top or show success state
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(`Failed to create estimate: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to create estimate:', error);
      alert('Sorry, there was an error creating your estimate. Please try again.');
    } finally {
      setIsCreatingEstimate(false);
    }
  };

  const handleLeadSubmit = async (data) => {
    // Save the form data and show addons section
    setFormData(data);
    setLeadData(data);
    
    // Show success message and scroll to addons
    alert('✅ Your details have been saved! Now you can configure your security system below.');
    
    // Scroll to addons section after a brief delay
    setTimeout(() => {
      if (addOnsRef.current) {
        addOnsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  // Helper function to build cart items from selected addons
  const buildCartFromSelectedAddons = (selectedAddons, context, productType) => {
    const cart = [];
    
    // Add base product as first item
    const baseProduct = {
      name: `${productType.charAt(0).toUpperCase() + productType.slice(1)} Alarm System`,
      qty: 1,
      unitPrice: 1295, // Base price - could be made dynamic
      description: `Base ${productType} alarm system for ${context} property`
    };
    cart.push(baseProduct);
    
    console.log('=== buildCartFromSelectedAddons Debug ===');
    console.log('selectedAddons:', selectedAddons);
    console.log('context:', context);
    console.log('addonProducts available:', addonProducts.length);
    
    // Add selected addons - use addonProducts (dynamic WooCommerce data) instead of staticAddons
    selectedAddons.forEach(selection => {
      console.log(`Looking for addon: ${selection.id}`);
      
      // First try to find in dynamic addon products (from WooCommerce)
      let addon = addonProducts.find(a => a.id === selection.id);
      
      // Fallback to static addons if not found in dynamic data
      if (!addon) {
        addon = staticAddons.find(a => a.id === selection.id);
        console.log(`Addon ${selection.id} not found in dynamic data, using static:`, addon ? 'found' : 'not found');
      } else {
        console.log(`Found addon ${selection.id} in dynamic data:`, addon.name);
      }
      
      if (addon) {
        // Handle unit price properly - extract the correct context price
        let unitPrice = 0;
        if (typeof addon.unitPrice === 'object' && addon.unitPrice !== null) {
          unitPrice = addon.unitPrice[context] || addon.unitPrice.residential || 0;
        } else if (typeof addon.unitPrice === 'number') {
          unitPrice = addon.unitPrice;
        }
        
        console.log(`Adding ${addon.name} with price ${unitPrice} for context ${context}`);
        
        cart.push({
          name: addon.name,
          qty: selection.quantity || selection.qty || 1,
          unitPrice: unitPrice, // Use the extracted price, not the object
          description: addon.summary || addon.description || ''
        });
      } else {
        console.warn(`Addon not found: ${selection.id}`);
      }
    });
    
    console.log('Final cart:', cart);
    console.log('=====================================');
    return cart;
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

        {/* Lead Capture Form - Show first */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Get Your Quote</h2>
              <p className="text-muted-foreground">
                Enter your details below to start configuring your security system
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
                productName: `${productType.charAt(0).toUpperCase() + productType.slice(1)} Alarm System`,
                cart: buildCartFromSelectedAddons(selectedAddons, context, productType)
              }}
              propertyContext={{
                propertyType: context,
                buildingType: 'standard'
              }}
              showPrice={!SHOW_PRICE}
            />
          </div>
        </section>

        {/* Add-ons Section - Always visible for testing */}
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
      </main>

      {/* Sticky Cart Bar */}
      <StickyCartBar
        selectedAddons={selectedAddons}
        estimatedTotal={estimatedTotal}
        onAddToCart={handleAddToQuote}
        isLoading={isCreatingEstimate}
        buttonText={isCreatingEstimate ? "Creating Estimate..." : "Get Your Quote"}
        context={context}
        productType={productType}
        showPrice={!SHOW_PRICE}
      />
    </div>
  );
}