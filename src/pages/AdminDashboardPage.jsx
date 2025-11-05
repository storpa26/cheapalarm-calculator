import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import { Skeleton } from '../shared/ui/skeleton';
import { Button } from '../shared/ui/button';
import { Input } from '../shared/ui/input';
import { Alert, AlertDescription } from '../shared/ui/alert';
import { 
  Search, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { API_BASE, checkAdminStatus } from '../lib/quoteStorage';

// Admin Dashboard Page Component
// Displays list of all estimates with search and filtering
export default function AdminDashboardPage() {
  const [estimates, setEstimates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verify admin status before rendering dashboard
  useEffect(() => {
    async function verifyAdmin() {
      try {
        setIsCheckingAuth(true);
        
        // Only check if window.caAdminMode is set
        if (window.caAdminMode === true) {
          console.log('🔒 Verifying admin status...');
          const isAdmin = await checkAdminStatus();
          setIsAuthorized(isAdmin);
          
          if (!isAdmin) {
            setError('Access Denied - You must be logged in as a WordPress administrator to access this page.');
            console.error('🚫 Admin access denied - user is not authorized');
          } else {
            console.log('✅ Admin access granted');
          }
        } else {
          // Not in admin mode, don't render
          setIsAuthorized(false);
          setError('This page is only accessible from WordPress admin.');
          console.error('🚫 Admin mode not enabled - window.caAdminMode is not set');
        }
      } catch (err) {
        console.error('Error verifying admin status:', err);
        setIsAuthorized(false);
        setError('Failed to verify admin status. Please refresh the page.');
      } finally {
        setIsCheckingAuth(false);
      }
    }
    
    verifyAdmin();
  }, []);

  // Fetch estimates list (only after authorization)
  useEffect(() => {
    if (!isAuthorized) return; // Don't fetch if not authorized
    
    async function fetchEstimates() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE}/wp-json/ca/v1/estimate/list?limit=100`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch estimates: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.ok && Array.isArray(data.items)) {
          setEstimates(data.items);
        } else {
          setEstimates([]);
        }
      } catch (err) {
        console.error('Error fetching estimates:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEstimates();
  }, [isAuthorized]);

  // Filter estimates based on search query
  const filteredEstimates = estimates.filter(estimate => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const name = (estimate.name || '').toLowerCase();
    const email = (estimate.contact?.email || '').toLowerCase();
    const estimateId = (estimate.estimateId || '').toLowerCase();
    
    return name.includes(query) || 
           email.includes(query) || 
           estimateId.includes(query);
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    
    if (statusLower === 'accepted' || statusLower === 'approved') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#e6f5f7', color: '#005667' }}>
          <CheckCircle className="w-3 h-3 mr-2" style={{ color: '#005667' }} />
          {status}
        </span>
      );
    }
    
    if (statusLower === 'rejected' || statusLower === 'declined') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#fce8ef', color: '#c95375' }}>
          <AlertCircle className="w-3 h-3 mr-2" style={{ color: '#c95375' }} />
          {status}
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#e6f5f7', color: '#288896' }}>
        <Clock className="w-3 h-3 mr-2" style={{ color: '#288896' }} />
        {status || 'Draft'}
      </span>
    );
  };

  // Handle estimate click - navigate to quote page
  const handleEstimateClick = (estimateId, locationId) => {
    // Always open in new tab to avoid routing issues
    // This works both in admin mode (no Router) and normal mode
    const quoteUrl = `${window.location.origin}/quote?estimateId=${estimateId}&locationId=${locationId || 'aLTXtdwNknfmEFo3WBIX'}&admin=1`;
    window.open(quoteUrl, '_blank');
  };

  // Show loading state while checking authorization
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <Card style={{ borderColor: '#e0e0e0', maxWidth: '500px' }}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#288896' }}></div>
              <p className="text-base font-medium" style={{ color: '#005667' }}>
                Verifying admin access...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <Card style={{ borderColor: '#c95375', maxWidth: '500px' }}>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="mt-2">
                <p className="font-semibold text-base mb-2">Access Denied</p>
                <p className="text-sm">{error || 'You must be logged in as a WordPress administrator to access this page.'}</p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#fafafa' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: '#e0e0e0' }}>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#c95375' }}>
              Estimates Dashboard
            </h1>
            <p className="mt-2 text-base" style={{ color: '#666' }}>
              Manage and view all estimates
            </p>
          </div>
          <div className="text-sm font-medium px-4 py-2 rounded-lg" style={{ backgroundColor: '#e6f5f7', color: '#005667' }}>
            <span style={{ color: '#288896', fontWeight: '600' }}>{filteredEstimates.length}</span> of <span style={{ color: '#288896', fontWeight: '600' }}>{estimates.length}</span> estimates
          </div>
        </div>

        {/* Search Bar */}
        <Card style={{ borderColor: '#e0e0e0' }}>
          <CardContent className="pt-6">
            <div 
              className="flex items-center border rounded-md h-12 px-4 transition-colors focus-within:border-[#288896]" 
              style={{ borderColor: '#e0e0e0' }}
            >
              <div className="flex items-center justify-center mr-3">
                <Search className="w-5 h-5" style={{ color: '#288896' }} />
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by name, email, or estimate ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-full text-base border-0 focus:ring-0 focus-visible:ring-0 p-0"
                  style={{ 
                    border: 'none',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WordPress Admin Links Test Section - Only show on localhost */}
        {/* Test section removed - fix is working. Uncomment below if needed for testing */}
        {/* 
        {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
          <Card style={{ borderColor: '#c95375', backgroundColor: '#fff5f7' }}>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#c95375' }}>
                🧪 WordPress Admin Links Test (Localhost Only)
              </h2>
              <p className="text-sm mb-4" style={{ color: '#666' }}>
                Click these links to test if React Router is intercepting WordPress admin links.
                Check the browser console and URL bar to see if they're being rewritten from /wp-admin to /admin
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="/wp-admin/edit.php?post_type=page" 
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#e6f5f7', color: '#005667', border: '1px solid #288896' }}
                >
                  Pages (/wp-admin/edit.php?post_type=page)
                </a>
                <a 
                  href="/wp-admin/edit.php?post_type=post" 
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#e6f5f7', color: '#005667', border: '1px solid #288896' }}
                >
                  Posts (/wp-admin/edit.php?post_type=post)
                </a>
                <a 
                  href="/wp-admin/admin.php?page=plugins" 
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#e6f5f7', color: '#005667', border: '1px solid #288896' }}
                >
                  Plugins (/wp-admin/admin.php?page=plugins)
                </a>
                <a 
                  href="/wp-admin/post.php?post=123&action=edit" 
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#e6f5f7', color: '#005667', border: '1px solid #288896' }}
                >
                  Edit Post (/wp-admin/post.php?post=123&action=edit)
                </a>
                <a 
                  href="/wp-admin/users.php" 
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#e6f5f7', color: '#005667', border: '1px solid #288896' }}
                >
                  Users (/wp-admin/users.php)
                </a>
                <a 
                  href="/wp-admin/themes.php" 
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#e6f5f7', color: '#005667', border: '1px solid #288896' }}
                >
                  Themes (/wp-admin/themes.php)
                </a>
              </div>
              <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: '#e6f5f7' }}>
                <p className="text-xs font-mono" style={{ color: '#005667' }}>
                  <strong>Expected behavior:</strong> These links should navigate to /wp-admin/... URLs<br/>
                  <strong>Current issue:</strong> They're being rewritten to /admin/... URLs
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        */}

        {/* Error State */}
        {error && (
          <Alert style={{ backgroundColor: '#fce8ef', borderColor: '#c95375' }}>
            <AlertCircle className="h-4 w-4 mr-2" style={{ color: '#c95375' }} />
            <AlertDescription style={{ color: '#c95375' }}>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} style={{ borderColor: '#e0e0e0' }}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" style={{ backgroundColor: '#e6f5f7' }} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEstimates.length === 0 ? (
          <Card style={{ borderColor: '#e0e0e0' }}>
            <CardContent className="pt-6 text-center py-16">
              <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: '#288896', opacity: 0.5 }} />
              <p style={{ color: '#666' }}>
                {searchQuery ? 'No estimates found matching your search.' : 'No estimates found.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Estimates List */
          <div className="space-y-4">
            {filteredEstimates.map((estimate) => (
              <Card 
                key={estimate.estimateId} 
                className="transition-all duration-200 cursor-pointer"
                style={{ 
                  borderColor: '#e0e0e0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#288896';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 136, 150, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
                onClick={() => handleEstimateClick(estimate.estimateId, estimate.locationId)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold" style={{ color: '#005667' }}>
                            {estimate.name || estimate.title || 'Unnamed Estimate'}
                          </h3>
                          <p className="text-sm mt-1.5 font-mono" style={{ color: '#666' }}>
                            ID: {estimate.estimateId}
                          </p>
                        </div>
                        {getStatusBadge(estimate.status)}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-3 text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: '#e6f5f7' }}>
                          <User className="w-4 h-4" style={{ color: '#288896' }} />
                          <span style={{ color: '#666' }}>Contact:</span>
                          <span className="font-semibold" style={{ color: '#005667' }}>
                            {estimate.contact?.name || estimate.contact?.email || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: '#e6f5f7' }}>
                          <Calendar className="w-4 h-4" style={{ color: '#288896' }} />
                          <span style={{ color: '#666' }}>Created:</span>
                          <span className="font-semibold" style={{ color: '#005667' }}>
                            {formatDate(estimate.createdAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: '#e6f5f7' }}>
                          <DollarSign className="w-4 h-4" style={{ color: '#288896' }} />
                          <span style={{ color: '#666' }}>Total:</span>
                          <span className="font-semibold" style={{ color: '#005667' }}>
                            {formatCurrency(estimate.total)}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button 
                          size="sm" 
                          className="w-full md:w-auto font-semibold"
                          style={{ 
                            backgroundColor: '#288896',
                            color: 'white',
                            border: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#005667';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#288896';
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View & Edit Estimate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

