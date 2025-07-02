"use client"

import type { Sale } from '@/types';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '../ui/badge';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export default function SaleDetailsModal({ isOpen, onClose, sale }: SaleDetailsModalProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'SDG' }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
  };
  
  if (!isOpen || !sale) return null;

  const discountAmount = sale.discountType === 'percentage' 
    ? sale.subtotal * (sale.discount / 100)
    : sale.discount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل الفاتورة #{sale.invoiceNumber}</DialogTitle>
          <DialogDescription>
            تاريخ الفاتورة: {formatDate(sale.date)}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
            <h3 className="font-semibold mb-2">المنتجات المباعة</h3>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead className="text-left">الإجمالي</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sale.items.map((item) => (
                        <TableRow key={item.productId}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-left">{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                    <h3 className="font-semibold mb-2">ملخص الدفع</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>الإجمالي الفرعي:</span><span>{formatCurrency(sale.subtotal)}</span></div>
                        <div className="flex justify-between"><span>الخصم:</span><span className="text-destructive">-{formatCurrency(discountAmount)}</span></div>
                        <div className="flex justify-between"><span>الضريبة ({sale.tax}%):</span><span className="text-green-600">+{formatCurrency(sale.subtotal * (sale.tax/100))}</span></div>
                        <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>الإجمالي النهائي:</span><span>{formatCurrency(sale.total)}</span></div>
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">معلومات إضافية</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>طريقة الدفع:</span>
                            <Badge variant="secondary">{sale.paymentMethod === 'cash' ? 'نقدي' : sale.paymentMethod}</Badge>
                        </div>
                    </div>
                </div>
            </div>

             {sale.returns && sale.returns.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">المرتجعات</h3>
                     <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>المنتج</TableHead>
                                <TableHead>الكمية المرتجعة</TableHead>
                                <TableHead>تاريخ الإرجاع</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sale.returns.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{sale.items.find(p => p.productId === item.productId)?.name || 'منتج غير معروف'}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{formatDate(item.date)}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
             )}

        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
