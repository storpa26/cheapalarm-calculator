import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { Plus, Calculator, AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import { AddonCard } from '../../features/addons/components/AddonCard';
import { AddonModal } from '../../features/addons/components/AddonModal';
import { CapacityMeter } from '../../widgets/capacity-meter/CapacityMeter';
// Dynamic-only integration: remove static fallbacks
import { RulesEngine } from '../../lib/rules';
import { formatCurrency } from '../../shared/lib/quote';
import { wooApi } from '../../shared/api/api';
import { useToast } from '../../hooks/use-toast';

export function AddOnsSection({
  context,
  productType,
  selectedAddons,
  onUpdateAddons,
  onAddonProductsChange, 
  estimatedTotal
}) {
  const { toast } = useToast();
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addonProducts, setAddonProducts] = useState([]);
  const [baseProductPrice, setBaseProductPrice] = useState(null);
  const [baseProduct, setBaseProduct] = useState(null);
  const [wooProductMap, setWooProductMap] = useState(new Map());
  const [wooProducts, setWooProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState(null);

  // Fetch addon-only products from WooCommerce
  useEffect(() => {
    const fetchAddonProducts = async () => {
      try {
        // Safety check - don't fetch if productType is invalid
        if (!productType) {
          console.warn('⚠️ ProductType is undefined, skipping API call');
          return;
        }
        
        setIsLoading(true);
        setError(null);
        
        // Fetch base product for pricing
        const baseProductData = await wooApi.getBaseAlarmProduct(productType);
        if (baseProductData) {
          setBaseProduct(baseProductData);
          
          // Use the base product price directly (same for all contexts)
          const basePrice = parseFloat(baseProductData.prices.price) / (10 ** baseProductData.prices.currency_minor_unit);
          
          // Base product price is the same for residential and retail
          const basePricing = {
            residential: basePrice,
            retail: basePrice,  // Same as residential
            office: basePrice,  // Same as residential
            warehouse: basePrice // Same as residential
          };
          setBaseProductPrice(basePricing);
        }
        
        // Fetch regular add-on products
        const wooProducts = await wooApi.getAlarmAddonProducts(productType);
        const mappedAddons = mapWooProductsToAddons(wooProducts);
        const autoRequiredWooProducts = await wooApi.getAutoRequiredProducts(productType);
        const mappedAutoRequired = mapWooProductsToAddons(autoRequiredWooProducts, true);
        setWooProducts([...wooProducts, ...autoRequiredWooProducts]);
        const allAddonProducts = [...mappedAddons, ...mappedAutoRequired];
        setAddonProducts(allAddonProducts);
        onAddonProductsChange(allAddonProducts);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch addon products:', err);
        setError('Failed to fetch add-on products from WooCommerce. Please try again.');
        setIsLoading(false);
      }
    };

    fetchAddonProducts();
  }, [productType, onAddonProductsChange]);

  // Map WooCommerce products to local Addon type
  const mapWooProductsToAddons = (products, isAutoAppended = false) => {
    return products.map(product => {
      // Check if meta_data exists, if not use an empty array
      const metaData = product.meta_data || [];
      
      // Create a mapping from WooCommerce slugs to expected addon IDs for rules engine compatibility
      const slugToIdMap = {
        // Wireless product slugs
        'outdoor-motion-sensor-pet-friendly': 'outpir',
        'touchscreen-keypad': 'tskp', 
        'wireless-smoke-detector': 'smoke',
        'panic-button-portable': 'panic',
        'glass-break-detector': 'glass',
        'door-window-sensor': 'door',
        'additional-keypad': 'keypad2',
        'input-expander': 'expander',
        'additional-power-supply': 'psu',
        // Hardwired product slugs (based on actual WooCommerce product names)
        'outdoor-motion-sensor-pet-friendly-wired': 'outpir',
        'touchscreen-keypad-wired': 'tskp',
        'additional-keypad-wired': 'keypad2',
        'door-window-sensor-wired': 'door',
        'glass-break-detector-wired': 'glass',
        'input-expander-wired': 'expander',
        'additional-power-supply-wired': 'psu',
        'panic-button-portable-wired': 'panic'
      };
      
      const addonId = slugToIdMap[product.slug] || product.slug;
      
      // Store WooCommerce product in map using mapped addon ID as key
      setWooProductMap(prev => {
        const next = new Map(prev);
        next.set(addonId, product.id); // Use mapped addon ID as key, store WooCommerce product ID
        return next;
      });

      // Extract addon type from meta data with safe default
      const typeMetaData = metaData.find(meta => meta.key === '_addon_type');
      const type = typeMetaData?.value || 'accessory';
      
      // Extract power consumption from meta data with safe default
      const powerMetaData = metaData.find(meta => meta.key === '_power_milliamps');
      const powerMilliAmps = powerMetaData ? Number(powerMetaData.value) : 0;
      
      // Extract whether it consumes input from meta data with safe default
      const consumesInputMeta = metaData.find(meta => meta.key === '_consumes_input');
      const consumesInput = consumesInputMeta ? consumesInputMeta.value === 'yes' : false;
      
      // Extract touchscreen property from meta data with safe default
      const isTouchscreenMeta = metaData.find(meta => meta.key === '_is_touchscreen');
      const isTouchscreen = isTouchscreenMeta ? isTouchscreenMeta.value === 'yes' : false;
      
      // Extract min/max quantities from meta data with safe defaults
      const qtyMinMeta = metaData.find(meta => meta.key === '_qty_min');
      const qtyMaxMeta = metaData.find(meta => meta.key === '_qty_max');
      
      const qtyMin = qtyMinMeta ? Number(qtyMinMeta.value) : 0;
      const qtyMax = qtyMaxMeta ? Number(qtyMaxMeta.value) : 10;
      
      // Extract bullet points from description
      const bullets = product.short_description
        ? extractBullets(product.short_description)
        : [];

      // Minimal helper: prefers <li>, falls back to <br>/<p>/plain text
      function extractBullets(html) {
        const div = document.createElement('div');
        div.innerHTML = html;

        // 1) If Woo used a real list, grab the <li> text
        const liTexts = Array.from(div.querySelectorAll('li'))
          .map(li => (li.textContent || '').trim())
          .filter(Boolean);
        if (liTexts.length) return liTexts;

        // 2) Otherwise convert <br>/<p> to lines and strip tags
        const text = div.innerHTML
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/?p[^>]*>/gi, '\n')
          .replace(/&nbsp;/gi, ' ')
          .replace(/<[^>]*>/g, '');
        return text.split(/\n|•|·|-/).map(s => s.trim()).filter(Boolean);
      }
      
      // Create pricing object for different contexts
      const priceValue = product.prices.price && !isNaN(parseFloat(product.prices.price)) 
        ? (parseFloat(product.prices.price)/(10**product.prices.currency_minor_unit)) 
        : 0; // Default to 0 if price is invalid
      
      // Use price_range if available: min_amount = Residential, max_amount = Retail
      let residentialPrice = priceValue;
      let retailPrice = priceValue * 1.15;
      
      if (product.prices.price_range) {
        const minAmount = product.prices.price_range.min_amount;
        const maxAmount = product.prices.price_range.max_amount;
        
        if (minAmount && !isNaN(parseFloat(minAmount))) {
          residentialPrice = parseFloat(minAmount) / (10 ** product.prices.currency_minor_unit);
        }
        
        if (maxAmount && !isNaN(parseFloat(maxAmount))) {
          retailPrice = parseFloat(maxAmount) / (10 ** product.prices.currency_minor_unit);
        }
      }
      
      const unitPrice = {
        residential: residentialPrice,
        retail: retailPrice,
        office: priceValue * 1.15,  // Use fallback pricing for office
        warehouse: priceValue * 1.3  // Use fallback pricing for warehouse
      };
      
      // Check for context-specific pricing in meta data
      // Use metaData instead of product.meta_data
      const residentialPriceMeta = metaData.find(meta => meta.key === '_price_residential');
      const retailPriceMeta = metaData.find(meta => meta.key === '_price_retail');
      const officePriceMeta = metaData.find(meta => meta.key === '_price_office');
      const warehousePriceMeta = metaData.find(meta => meta.key === '_price_warehouse');
      
      if (residentialPriceMeta) unitPrice.residential = Number(residentialPriceMeta.value);
      if (retailPriceMeta) unitPrice.retail = Number(retailPriceMeta.value);
      if (officePriceMeta) unitPrice.office = Number(officePriceMeta.value);
      if (warehousePriceMeta) unitPrice.warehouse = Number(warehousePriceMeta.value);
      
      return {
        id: addonId, // Use mapped ID for rules engine compatibility
        name: product.name,
        type: type,
        consumesInput,
        powerMilliAmps,
        unitPrice,
        summary: product.short_description || '',
        bullets: bullets.length > 0 ? bullets : ["No details available"],
        qtyMin,
        qtyMax,
        isTouchscreen,
        isAutoAppended
      };
    });
  };

  const rulesEngine = new RulesEngine(addonProducts, baseProductPrice || undefined);
  const validation = rulesEngine.validateSelection(selectedAddons);
  const capacityLimits = rulesEngine.getCapacityLimits(selectedAddons);
  
  // Calculate real-time estimated total
  const calculatedTotal = rulesEngine.calculateTotal(selectedAddons, context);

  // Filter out auto-appended items from the main grid
  const userSelectableAddons = addonProducts.filter(addon => !addon.isAutoAppended);

  const getSelectedQuantity = (addonId) => {
    const selected = selectedAddons.find(s => s.id === addonId);
    return selected ? selected.quantity : 0;
  };

  const handleAddonClick = (addon) => {
    setSelectedAddon(addon);
    setIsModalOpen(true);
  };

  const handleModalSave = (quantity, include) => {
    if (!selectedAddon) return;
    
    const updatedAddons = [...selectedAddons];
    const existingIndex = updatedAddons.findIndex(a => a.id === selectedAddon.id);
    
    if (include && quantity > 0) {
      if (existingIndex >= 0) {
        updatedAddons[existingIndex] = { id: selectedAddon.id, quantity };
      } else {
        updatedAddons.push({ id: selectedAddon.id, quantity });
      }
    } else {
      if (existingIndex >= 0) {
        updatedAddons.splice(existingIndex, 1);
      }
    }
    
    onUpdateAddons(updatedAddons);
  };

  const getAutoAppendedItems = () => {
    return validation.autoAppendedItems.map(item => {
      const addon = addonProducts.find(a => a.id === item.id);
      return addon ? { addon, quantity: item.quantity, reason: item.reason } : null;
    }).filter(Boolean);
  };

  // Helper function to get variation data for variable products
  const getVariationForContext = (product, context) => {
    // Check if this product has variations
    if (!product.variations || product.variations.length === 0) {
      return null; // Simple product, no variation needed
    }

    // Find the variation that matches the context
    const targetValue = context === 'residential' ? '"Residential"' : '"Retail"';
    const matchingVariation = product.variations.find(variation => 
      variation.attributes.some(attr => 
        attr.name === 'Property Type' && attr.value === targetValue
      )
    );

    if (matchingVariation) {
      console.log(`🛒 Found variation ${matchingVariation.id} for ${product.name}: ${context}`);
      return {
        variation_id: matchingVariation.id,
        variation: {
          'Property Type': targetValue
        }
      };
    }

    // Fallback: use first variation if no exact match
    const fallbackVariation = product.variations[0];
    console.log(`🛒 Using fallback variation ${fallbackVariation.id} for ${product.name}`);
    return {
      variation_id: fallbackVariation.id,
      variation: fallbackVariation.attributes.reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {})
    };
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      setError(null);

      console.log('🛒 Starting cart operation...');
      console.log('🛒 Selected addons:', selectedAddons);
      console.log('🛒 Validation result:', validation);
      
      // Prepare items for WooCommerce cart
      const cartItems = [];
      
      // Add base product (always included)
      if (baseProduct) {
        console.log('🛒 Adding base product:', baseProduct.id, baseProduct.name);
        cartItems.push({
          id: baseProduct.id,
          quantity: 1,
          meta: {
            context: context,
            package_type: 'base_system',
            product_name: baseProduct.name
          }
        });
      } else {
        throw new Error('Base product not found');
      }
      
      // Add selected add-ons (user selections)
      console.log('🛒 Processing selected add-ons:', selectedAddons);
      console.log('🛒 Available addon products:', addonProducts.map(a => ({ id: a.id, name: a.name, isAutoAppended: a.isAutoAppended })));
      console.log('🛒 WooCommerce product map:', Array.from(wooProductMap.entries()));
      
      for (const selection of selectedAddons) {
        console.log(`🛒 Processing selection: ${selection.id} x${selection.quantity}`);
        const addon = addonProducts.find(a => a.id === selection.id && !a.isAutoAppended);
        console.log(`🛒 Found addon:`, addon ? { id: addon.id, name: addon.name, isAutoAppended: addon.isAutoAppended } : 'NOT FOUND');
        
        if (addon) {
          const wooProductId = wooProductMap.get(selection.id);
          console.log(`🛒 Adding addon: ${addon.name} (Slug: ${selection.id} → WooCommerce ID: ${wooProductId})`);
          
          if (wooProductId) {
            // Find the original WooProduct for variation detection
            const wooProduct = wooProducts.find(p => p.id === wooProductId);
            const variationData = wooProduct ? getVariationForContext(wooProduct, context) : null;
            
            const cartItem = {
              // Use variation ID if available, otherwise use parent product ID
              id: variationData?.variation_id || wooProductId,
              quantity: selection.quantity,
              meta: {
                addon_type: addon.type,
                context: context,
                product_name: addon.name,
                user_selected: true
              }
            };
            
            // Add variation attributes if using parent product ID
            if (variationData && !variationData.variation_id) {
              cartItem.variation = variationData.variation;
            }
            
            cartItems.push(cartItem);
          } else {
            console.warn(`⚠️ No WooCommerce product ID found for slug: ${selection.id}`);
          }
        } else {
          console.warn(`⚠️ Addon not found in products list: ${selection.id}`);
        }
      }
      
      // Add auto-appended items (system requirements)
      console.log('🛒 Processing auto-appended items:', validation.autoAppendedItems);
      
      for (const item of validation.autoAppendedItems) {
        console.log(`🛒 Processing auto-required: ${item.id} x${item.quantity}`);
        const addon = addonProducts.find(a => a.id === item.id);
        console.log(`🛒 Found auto-required addon:`, addon ? { id: addon.id, name: addon.name } : 'NOT FOUND');
        
        if (addon) {
          const wooProductId = wooProductMap.get(item.id);
          console.log(`🛒 Adding auto-required: ${addon.name} (ID: ${item.id} → WooCommerce ID: ${wooProductId})`);
          console.log(`🛒 Reason: ${item.reason}`);
          
          if (wooProductId) {
            cartItems.push({
              id: wooProductId,
              quantity: item.quantity,
              meta: {
                auto_added: true,
                reason: item.reason,
                context: context,
                product_name: addon.name
              }
            });
          } else {
            console.warn(`⚠️ No WooCommerce product ID found for auto-required: ${item.id}; skipping dynamic-only flow`);
          }
        } else {
          console.warn(`⚠️ Auto-required addon not found: ${item.id}`);
        }
      }
      
      console.log('🛒 Final cart items to add:', cartItems);
      
      if (cartItems.length === 0) {
        throw new Error('No valid items to add to cart');
      }
      
      // Add items to WooCommerce cart one by one for better error handling
      let addedCount = 0;
      for (const item of cartItems) {
        try {
          console.log(`🛒 Adding item ${addedCount + 1}/${cartItems.length}:`, item);
          await wooApi.addItemsToCart([item]);
          addedCount++;
          console.log(`✅ Successfully added item ${addedCount}`);
        } catch (itemError) {
          console.error(`❌ Failed to add item:`, item, itemError);
          // Continue with other items rather than failing completely
        }
      }
      
      if (addedCount === 0) {
        throw new Error('Failed to add any items to cart');
      }
      
      // Verify final cart state
      const finalCart = await wooApi.getCart();
      console.log('🛒 Final cart state:', finalCart);
      
      // Save current state to localStorage before page reload
       const stateToSave = {
         selectedAddons,
         context,
         productType,
         estimatedTotal,
         timestamp: Date.now(),
         shouldOpenSideCart: true // Flag to indicate side cart should open after reload
       };
       
       try {
         localStorage.setItem('addons-section-state', JSON.stringify(stateToSave));
         console.log('💾 AddOnsSection: State saved to localStorage before reload');
       } catch (error) {
         console.error('Failed to save AddOnsSection state:', error);
       }
      
      // Show success message
      toast({
        title: "🎉 Items Added to Cart!",
        description: `Successfully added ${addedCount} items. Refreshing to update cart...`,
      });
      
      // Force page reload to trigger Xootix Side Cart update
      console.log('🔄 AddOnsSection: Reloading page to update cart...');
      setTimeout(() => {
        console.log('🔄 AddOnsSection: EXECUTING PAGE RELOAD NOW!');
        window.location.reload();
      }, 1000);
       
     } catch (err) {
       console.error('❌ Cart operation failed:', err);
       const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
       setError(`Failed to add items to cart: ${errorMessage}`);
       toast({
         title: "Failed to Add Items",
         description: `Error: ${errorMessage}. Please try again.`,
         variant: "destructive",
       });
     } finally {
       setIsAddingToCart(false);
     }
   };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Add-Ons & Upgrades</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Customize your security system with additional sensors and features
            </p>
          </div>
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && addonProducts.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Add-Ons & Upgrades</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Customize your security system with additional sensors and features
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load Add-ons</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="mx-auto"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Add-Ons & Upgrades</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Customize your security system with additional sensors and features
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {userSelectableAddons.map(addon => (
                <AddonCard
                  key={addon.id}
                  addon={addon}
                  context={context}
                  selectedQuantity={getSelectedQuantity(addon.id)}
                  onClick={() => handleAddonClick(addon)}
                />
              ))}
            </div>

            {/* Auto-appended items */}
            {validation.autoAppendedItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Required Additions
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAutoAppendedItems().map(({ addon, quantity }) => (
                    <AddonCard
                      key={`auto-${addon.id}`}
                      addon={addon}
                      context={context}
                      selectedQuantity={quantity}
                      isAutoAppended={true}
                      onClick={() => {}}
                    />
                  ))}
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-yellow-800">Why these items were added:</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {validation.autoAppendedItems.map((item, index) => (
                        <li key={index}>• {item.reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Violations */}
            {validation.violations.length > 0 && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Configuration Issues</h4>
                <ul className="space-y-1">
                  {validation.violations.map((violation, index) => (
                    <li key={index} className="text-sm text-red-700">• {violation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <CapacityMeter limits={capacityLimits} violations={validation.violations} />

            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Estimated Total
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(calculatedTotal)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Including professional installation
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base package:</span>
                    <span>{formatCurrency(baseProductPrice ? baseProductPrice[context] : 0)}</span>
                  </div>
                  
                  {selectedAddons.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-medium">Selected Add-ons:</div>
                      {selectedAddons.map((selection) => {
                        const addon = addonProducts.find(a => a.id === selection.id);
                        if (!addon || addon.isAutoAppended) return null;
                        return (
                          <div key={selection.id} className="flex justify-between text-xs pl-2">
                            <span>{addon.name} × {selection.quantity}</span>
                            <span>{formatCurrency(addon.unitPrice[context] * selection.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {validation.autoAppendedItems.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-medium text-yellow-700">Required Add-ons:</div>
                      {validation.autoAppendedItems.map((item) => {
                        const addon = addonProducts.find(a => a.id === item.id);
                        if (!addon) return null;
                        return (
                          <div key={item.id} className="flex justify-between text-xs pl-2 text-yellow-700">
                            <span>{addon.name} × {item.quantity}</span>
                            <span>{formatCurrency(addon.unitPrice[context] * item.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleAddToCart}
                  disabled={validation?.violations?.length > 0 || isLoading || isAddingToCart}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Final price may vary based on site conditions and installation requirements
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <AddonModal
          addon={selectedAddon}
          context={context}
          isOpen={isModalOpen}
          currentQuantity={getSelectedQuantity(selectedAddon?.id || '')}
          validation={validation}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
        />
      </div>
    </section>
  );
}