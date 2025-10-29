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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40">
            <TableHead className="w-[100px] text-base font-semibold text-foreground py-4 px-6">SKU</TableHead>
            <TableHead className="text-base font-semibold text-foreground py-4 px-6">Item Name</TableHead>
            <TableHead className="w-[100px] text-center text-base font-semibold text-foreground py-4 px-6">Qty</TableHead>
            <TableHead className="text-base font-semibold text-foreground py-4 px-6">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id || item.sku || index} className="border-b border-border/20 last:border-b-0 hover:bg-muted/20 transition-colors">
              <TableCell className="font-semibold text-sm text-foreground py-6 px-6">
                {item.sku}
              </TableCell>
              <TableCell className="font-semibold text-base text-foreground py-6 px-6">
                {item.name}
              </TableCell>
              <TableCell className="text-center font-semibold text-base text-foreground py-6 px-6">
                {item.qty}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm font-medium leading-relaxed py-6 px-6">
                {item.desc}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
