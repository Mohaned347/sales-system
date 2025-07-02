"use client"

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, RefreshCw, CornerUpLeft, Eye, Archive } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import SaleModal from './sale-modal';
import ReturnProductModal from './return-product-modal';
import SaleDetailsModal from './sale-details-modal';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from '../ui/skeleton';
import type { Sale } from '@/types';

export default function Sales() {
  const { sales, loading, addSale, updateSale, deleteSale, returnProduct, refreshData, getProductById } = useAppContext();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [showDeletedProducts, setShowDeletedProducts] = useState(false);

  const handleSubmitSale = async (saleData: Omit<Sale, 'id'>) => {
    try {
      if (currentSale) {
        await updateSale(currentSale.id, saleData);
        toast({ title: 'تم تحديث البيع بنجاح' });
      } else {
        await addSale(saleData);
        toast({ title: 'تمت إضافة البيع بنجاح' });
      }
      setIsSaleModalOpen(false);
      setCurrentSale(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'حدث خطأ', description: error.message });
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف عملية البيع؟ سيتم إرجاع المنتجات للمخزون.')) {
      try {
        await deleteSale(id);
        toast({ title: 'تم حذف عملية البيع بنجاح' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'حدث خطأ أثناء حذف البيع' });
      }
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setCurrentSale(sale);
    setIsDetailsModalOpen(true);
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('ar-EG');
  const formatCurrency = (amount: number) => new Intl.NumberFormat('ar-SD', { style: 'currency', currency: 'SDG' }).format(amount || 0);

  const filteredSales = sales.filter(sale => {
    const saleContainsDeletedProduct = sale.items.some(item => !getProductById(item.productId));
    if (showDeletedProducts && !saleContainsDeletedProduct) return false;

    if (!searchTerm) return true;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return sale.items.some(item => {
      const product = getProductById(item.productId);
      return product?.name.toLowerCase().includes(lowercasedTerm) || item.name.toLowerCase().includes(lowercasedTerm);
    }) || sale.invoiceNumber.toLowerCase().includes(lowercasedTerm);
  });

  const getProductNames = (sale: Sale) => {
    return sale.items.map(item => `${item.name} (${item.quantity})`).join('، ');
  };

  const getTotalItems = (sale: Sale) => sale.items.reduce((sum, item) => sum + item.quantity, 0);

  const hasReturnableItems = (sale: Sale) => {
    return sale.items.some(item => {
      const returnedQty = sale.returns?.reduce((sum, r) => r.productId === item.productId ? sum + r.quantity : sum, 0) || 0;
      return item.quantity > returnedQty;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>إدارة المبيعات</CardTitle>
                <CardDescription>عرض وتعديل جميع عمليات البيع المسجلة.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button onClick={refreshData} variant="outline"><RefreshCw className="ml-2 h-4 w-4" /> تحديث</Button>
                <Button onClick={() => setShowDeletedProducts(!showDeletedProducts)} variant={showDeletedProducts ? 'default' : 'secondary'}>
                    <Archive className="ml-2 h-4 w-4" /> {showDeletedProducts ? 'إخفاء المؤرشف' : 'إظهار المؤرشف'}
                </Button>
                <Button onClick={() => { setCurrentSale(null); setIsSaleModalOpen(true); }}>
                    <Plus className="ml-2 h-4 w-4" /> بيع جديد
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="ابحث برقم الفاتورة أو اسم المنتج..."
                    className="w-full max-w-sm pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الفاتورة</TableHead>
                <TableHead>المنتجات</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>الدفع</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id} className={sale.items.some(item => !getProductById(item.productId)) ? 'bg-muted/50' : ''}>
                    <TableCell className="font-mono text-xs">#{sale.invoiceNumber}</TableCell>
                    <TableCell className="max-w-xs truncate" title={getProductNames(sale)}>
                      {getProductNames(sale)}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(sale.total)}</TableCell>
                    <TableCell><Badge variant="secondary">{sale.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</Badge></TableCell>
                    <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell className="text-left">
                      <div className="flex justify-start gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(sale)} title="عرض التفاصيل"><Eye className="h-4 w-4" /></Button>
                        {hasReturnableItems(sale) && <Button variant="ghost" size="icon" onClick={() => { setCurrentSale(sale); setIsReturnModalOpen(true); }} title="إرجاع"><CornerUpLeft className="h-4 w-4" /></Button>}
                        <Button variant="ghost" size="icon" onClick={() => { setCurrentSale(sale); setIsSaleModalOpen(true); }} title="تعديل"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSale(sale.id)} title="حذف"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد عمليات بيع مسجلة'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <SaleModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} onSubmit={handleSubmitSale} sale={currentSale} />
      <ReturnProductModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} sale={currentSale} />
      <SaleDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} sale={currentSale} />
    </Card>
  );
}
