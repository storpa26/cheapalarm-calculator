import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { API_BASE } from '../lib/quoteStorage';

// Admin Dashboard Page Component
// Displays list of all estimates with search and filtering
export default function AdminDashboardPage() {
  const [estimates, setEstimates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch estimates list
  useEffect(() => {
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
  }, []);

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
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          {status}
        </span>
      );
    }
    
    if (statusLower === 'rejected' || statusLower === 'declined') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          {status}
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Clock className="w-3 h-3 mr-1" />
        {status || 'Draft'}
      </span>
    );
  };

  // Handle estimate click - navigate to quote page
  const handleEstimateClick = (estimateId, locationId) => {
    // Check if we're in WordPress admin context
    const isWpAdmin = window.caAdminMode === true;
    
    if (isWpAdmin) {
      // Open in new tab when in WP admin
      const quoteUrl = `${window.location.origin}/quote?estimateId=${estimateId}&locationId=${locationId || 'aLTXtdwNknfmEFo3WBIX'}&admin=1`;
      window.open(quoteUrl, '_blank');
    } else {
      // Normal navigation in React app
      const quoteUrl = `/quote?estimateId=${estimateId}&locationId=${locationId || 'aLTXtdwNknfmEFo3WBIX'}&admin=1`;
      navigate(quoteUrl);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Estimates Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all estimates
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredEstimates.length} of {estimates.length} estimates
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name, email, or estimate ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEstimates.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
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
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleEstimateClick(estimate.estimateId, estimate.locationId)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {estimate.name || estimate.title || 'Unnamed Estimate'}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            ID: {estimate.estimateId}
                          </p>
                        </div>
                        {getStatusBadge(estimate.status)}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Contact:</span>
                          <span className="font-medium">
                            {estimate.contact?.name || estimate.contact?.email || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-medium">
                            {formatDate(estimate.createdAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">
                            {formatCurrency(estimate.total)}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
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

