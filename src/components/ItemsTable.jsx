import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../shared/ui/table';

// Items table component that displays quote items in a clean table format
// Shows SKU, name, quantity, and description for each item in the quote
export function ItemsTable({ items }) {
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
                {item.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
