"use client"

import { useState, useEffect } from 'react';
import type { Sale, Product } from '@/types';
import { useAppContext } from '@/context/app-context';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

interface ReturnItem {
  productId: string;
  name: string;
  quantity: number;
  maxReturnable: number;
}

export default function ReturnProductModal({ isOpen, onClose, sale }: ReturnModalProps) {
  const { returnProduct, getProductById } = useAppContext();
  const { toast } = useToast();
  const [itemsToReturn, setItemsToReturn] = useState<ReturnItem[]>([]);

  useEffect(() => {
    if (sale) {
      const returnableItems = sale.items.map(item => {
        const returnedQuantity = sale.returns?.reduce((sum, r) => 
          r.productId === item.productId ? sum + r.quantity : sum, 0) || 0;
        const maxReturnable = item.quantity - returnedQuantity;
        
        return {
          productId: item.productId,
          name: item.name,
          quantity: 0,
          maxReturnable: maxReturnable,
        };
      }).filter(item => item.maxReturnable > 0);
      setItemsToReturn(returnableItems);
    }
  }, [sale]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setItemsToReturn(prevItems => prevItems.map(item => 
      item.productId === productId ? { ...item, quantity: Math.max(0, Math.min(item.maxReturnable, quantity)) } : item
    ));
  };

  const handleSubmit = async () => {
    if (!sale) return;

    try {
      let returnedSomething = false;
      for (const item of itemsToReturn) {
        if (item.quantity > 0) {
          await returnProduct({
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
          });
          returnedSomething = true;
        }
      }
      if (returnedSomething) {
        toast({ title: 'تمت عملية الإرجاع بنجاح' });
        onClose();
      } else {
        toast({ variant: 'destructive', title: 'لم يتم تحديد أي منتجات للإرجاع' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء عملية الإرجاع' });
      console.error(error);
    }
  };

  if (!isOpen || !sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إرجاع منتجات</DialogTitle>
          <DialogDescription>
            حدد الكميات التي تود إرجاعها من فاتورة رقم #{sale.invoiceNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>الكمية المتاحة للإرجاع</TableHead>
                <TableHead>الكمية المرتجعة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsToReturn.map(item => (
                <TableRow key={item.productId}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.maxReturnable}</TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 0)}
                      max={item.maxReturnable}
                      min={0}
                      className="w-24"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="button" onClick={handleSubmit}>تأكيد الإرجاع</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
