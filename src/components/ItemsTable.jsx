import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../shared/ui/table';

// Items table component that displays quote items in a clean table format
// Shows SKU, name, quantity, description, and price (admin-editable) for each item
export function ItemsTable({ items, isAdmin = false, onItemsChange }) {
  // If no items provided, show empty state
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No items found in this quote.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ 
              width: '100px', 
              textAlign: 'left', 
              padding: '16px 24px', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              SKU
            </th>
            <th style={{ 
              textAlign: 'left', 
              padding: '16px 24px', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              Item Name
            </th>
            <th style={{ 
              width: '100px', 
              textAlign: 'center', 
              padding: '16px 24px', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              Qty
            </th>
            <th style={{ 
              textAlign: 'left', 
              padding: '16px 24px', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              Description
            </th>
            {isAdmin && (
              <th style={{ 
                width: '120px', 
                textAlign: 'right', 
                padding: '16px 24px', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#111827' 
              }}>
                Price (Unit)
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr 
              key={item.id || item.sku || index} 
              style={{ 
                borderBottom: '1px solid #f3f4f6',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <td style={{ 
                padding: '20px 24px', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#111827' 
              }}>
                {item.sku}
              </td>
              <td style={{ 
                padding: '20px 24px', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#111827' 
              }}>
                {item.name}
              </td>
              <td style={{ 
                textAlign: 'center', 
                padding: '20px 24px', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#111827' 
              }}>
                {item.qty}
              </td>
              <td style={{ 
                padding: '20px 24px', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                {(() => {
                  const html = String(item.desc || '');
                  const hasImg = /<img\s/i.test(html);
                  if (hasImg) {
                    // Show only the provided images block
                    return <div dangerouslySetInnerHTML={{ __html: html }} />;
                  }
                  // No images -> show a clear message
                  return <div style={{ fontWeight: 600, color: '#6b7280' }}>No photos provided</div>;
                })()}
              </td>
              {isAdmin && (
                <td style={{ 
                  textAlign: 'right', 
                  padding: '20px 24px', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#111827'
                }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.amount || 0}
                    onChange={(e) => {
                      const newAmount = parseFloat(e.target.value) || 0;
                      const updated = items.map((it, idx) => 
                        idx === index ? { ...it, amount: newAmount } : it
                      );
                      onItemsChange?.(updated);
                    }}
                    style={{
                      width: '100px',
                      padding: '6px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      textAlign: 'right'
                    }}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
