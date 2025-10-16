import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Alert, AlertDescription } from '../../shared/ui/alert';
import { SHOW_PRICE } from '../../shared/config/flags';
import { ShoppingCart, User, Mail, Phone, MapPin, Hash, CheckCircle, AlertCircle } from 'lucide-react';

export function LeadCaptureForm({ onSubmit, isLoading = false, productContext, propertyContext, showPrice }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    productContext,
    propertyContext
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const shouldShowPrice = showPrice ?? SHOW_PRICE;

  // Validation functions
  const validatePhone = (phone) => {
    // Australian phone number validation (mobile and landline)
    const mobileRegex = /^(\+61|0)[4-5]\d{8}$/;
    const landlineRegex = /^(\+61|0)[2-8]\d{8}$/;
    const cleanPhone = phone.replace(/\s+/g, '');
    return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
  };

  const validatePostcode = (postcode) => {
    // Australian postcode validation (4 digits)
    return /^\d{4}$/.test(postcode);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Australian phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else if (!validatePostcode(formData.postcode)) {
      newErrors.postcode = 'Please enter a valid 4-digit Australian postcode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // Import the GHL API functions
      const { submitLeadToGHL } = await import('../../lib/ghl-api');
      
      // For the new workflow, form submission only creates/updates the contact
      const result = await submitLeadToGHL(formData);
      
      if (result.success) {
        setSubmitStatus('success');
        const isGHLDisabled = import.meta.env.VITE_DISABLE_GHL_INTEGRATION === 'true';
        let message = isGHLDisabled 
          ? '🔧 Development Mode: Contact saved successfully (GHL integration disabled)'
          : `✅ Thank you! Your contact information has been saved. Now click "Add to Cart" to create your estimate.`;
        
        setSubmitMessage(message);
        // Call the original onSubmit for any additional handling
        onSubmit(formData);
      } else {
        // Surface server error details if available
        const errMsg = result.error || 'Failed to save contact information';
        setSubmitStatus('error');
        setSubmitMessage(errMsg);
        return;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Sorry, there was an error saving your information. Please try again.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <ShoppingCart className="h-5 w-5" />
          Get Your Quote
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {productContext ? 
            `Get pricing for ${productContext.productType} ${productContext.context} system` :
            'Get your personalized quote and explore add-on options'
          }
        </p>
      </CardHeader>
      
      <CardContent>
        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {submitMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {submitStatus === 'error' && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {submitMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Full Name *
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full ${errors.name ? 'border-red-500' : ''}`}
              required
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full ${errors.email ? 'border-red-500' : ''}`}
              required
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4" />
              Phone Number *
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="04XX XXX XXX or 02 XXXX XXXX"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full ${errors.phone ? 'border-red-500' : ''}`}
              required
            />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              Property Address *
            </label>
            <Input
              id="address"
              type="text"
              placeholder="Enter your property address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full ${errors.address ? 'border-red-500' : ''}`}
              required
            />
            {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="postcode" className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4" />
              Postcode *
            </label>
            <Input
              id="postcode"
              type="text"
              placeholder="e.g. 2000"
              value={formData.postcode}
              onChange={(e) => handleInputChange('postcode', e.target.value)}
              className={`w-full ${errors.postcode ? 'border-red-500' : ''}`}
              maxLength={4}
              required
            />
            {errors.postcode && <p className="text-xs text-red-600">{errors.postcode}</p>}
          </div>

          {/* Product & Property Context Display */}
          {(productContext || propertyContext) && (
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="font-medium mb-2">Quote Details:</p>
              
              {productContext && (
                 <div className="mb-2">
                   <p className="text-muted-foreground">
                     <span className="font-medium">System:</span> {productContext.productName || `${productContext.productType} ${productContext.context} System`}
                     {shouldShowPrice && productContext.estimatedTotal && (
                       <span className="font-medium text-primary ml-2">
                         Est. ${productContext.estimatedTotal.toLocaleString()}
                       </span>
                     )}
                   </p>
                 </div>
               )}
              
              {propertyContext && (
                <div>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Property:</span> {propertyContext.propertyType}
                    {propertyContext.buildingType && (
                      <span className="ml-1">({propertyContext.buildingType})</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading || submitStatus === 'success'}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : submitStatus === 'success' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submitted Successfully
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Get My Quote
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            * Required fields. We respect your privacy and won't spam you.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}