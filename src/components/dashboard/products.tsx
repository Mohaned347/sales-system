
"use client"

import { useState } from 'react';
import { Plus, FilePenLine, Trash2, Search, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import ProductModal from './product-modal';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from '../ui/skeleton';
import type { Product } from '@/types';

export default function Products() {
  const { products, loading, addProduct, updateProduct, deleteProduct, refreshData } = useAppContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const handleSubmit = async (productData: Omit<Product, 'id'>) => {
    try {
      if (currentProduct) {
        await updateProduct(currentProduct.id, productData);
        toast({ title: 'تم تحديث المنتج بنجاح' });
      } else {
        await addProduct(productData);
        toast({ title: 'تم إضافة المنتج بنجاح' });
      }
      setIsModalOpen(false);
      setCurrentProduct(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء حفظ المنتج' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
      try {
        await deleteProduct(id);
        toast({ title: 'تم حذف المنتج بنجاح' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'حدث خطأ أثناء حذف المنتج' });
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  type="text"
                  placeholder="ابحث بالاسم، التصنيف أو الباركود..."
                  className="w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={refreshData} variant="outline" className="flex-1 sm:flex-auto">
                  <RefreshCw className="ml-2 h-4 w-4" /> تحديث
              </Button>
              <Button
                  onClick={() => {
                      setCurrentProduct(null);
                      setIsModalOpen(true);
                  }}
                  className="flex-1 sm:flex-auto"
              >
                  <Plus className="ml-2 h-4 w-4" /> إضافة منتج
              </Button>
          </div>
      </div>
      
      <div className="rounded-md border">
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>المخزون</TableHead>
                      <TableHead>التصنيف</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          </TableRow>
                      ))
                  ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                              <TableCell className="font-medium">
                                  {product.name}
                                  {product.barcode && <div className="text-xs text-muted-foreground">باركود: {product.barcode}</div>}
                              </TableCell>
                              <TableCell>{product.price.toFixed(2)} ج.س</TableCell>
                              <TableCell>
                                  <Badge variant={
                                      product.stock > 10 ? 'default' :
                                      product.stock > 0 ? 'secondary' :
                                      'destructive'
                                  }>
                                      {product.stock}
                                  </Badge>
                              </TableCell>
                              <TableCell>{product.category || '---'}</TableCell>
                              <TableCell className="text-left">
                                  <div className="flex justify-start gap-2">
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                              setCurrentProduct(product);
                                              setIsModalOpen(true);
                                          }}
                                      >
                                          <FilePenLine className="h-4 w-4" />
                                      </Button>
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-destructive hover:text-destructive"
                                          onClick={() => handleDelete(product.id)}
                                      >
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                  </div>
                              </TableCell>
                          </TableRow>
                      ))
                  ) : (
                      <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                              {searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد منتجات متاحة. ابدأ بإضافة منتج جديد.'}
                          </TableCell>
                      </TableRow>
                  )}
              </TableBody>
          </Table>
      </div>
      
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        product={currentProduct}
      />
    </div>
  );
}
