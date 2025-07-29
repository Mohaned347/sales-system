"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import type { Sale } from '@/types';

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const saleItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string(),
  price: z.number(),
  quantity: z.coerce.number().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
});

const saleFormSchema = z.object({
  invoiceNumber: z.string().optional(),
  date: z.string().min(1, 'التاريخ مطلوب'),
  items: z.array(saleItemSchema).min(1, 'يجب إضافة منتج واحد على الأقل'),
  discount: z.coerce.number().min(0).default(0),
  discountType: z.enum(['fixed', 'percentage']).default('fixed'),
  tax: z.coerce.number().min(0).default(0),
  paymentMethod: z.string().default('cash'),
  userId: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  sale: Sale | null;
}

export default function SaleModal({ isOpen, onClose, onSubmit, sale }: SaleModalProps) {
    const { products } = useAppContext();
    const { toast } = useToast();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    
    const { register, control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<SaleFormValues>({
        resolver: zodResolver(saleFormSchema),
        defaultValues: {
            items: [],
            discountType: 'fixed',
            discount: 0,
            tax: 0,
            paymentMethod: 'cash',
            date: '', // Initialize date as empty to avoid hydration mismatch
        }
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'items'
    });

    const watchedItems = watch('items');
    const watchedDiscount = watch('discount');
    const watchedDiscountType = watch('discountType');
    const watchedTax = watch('tax');

    const subtotal = useMemo(() => 
        watchedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [watchedItems]);

    const total = useMemo(() => {
        const discountAmount = watchedDiscountType === 'percentage' 
          ? subtotal * (watchedDiscount / 100)
          : watchedDiscount;
        const taxAmount = subtotal * (watchedTax / 100);
        return subtotal - discountAmount + taxAmount;
    }, [subtotal, watchedDiscount, watchedDiscountType, watchedTax]);

    useEffect(() => {
        if (sale) {
            reset({
                ...sale,
                items: sale.items || [],
                date: sale.date || '',
            });
        } else {
            reset({
                items: [],
                discountType: 'fixed',
                discount: 0,
                tax: 0,
                paymentMethod: 'cash',
                date: '',
            });
        }
    }, [sale, reset]);

    const handleFormSubmit: SubmitHandler<SaleFormValues> = async (data) => {
        await onSubmit(data);
    };

    const handleAddProduct = () => {
        const product = products.find((p: any) => p.id === selectedProductId);
        if (!product) return;
        append({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: selectedQuantity,
        });
        setSelectedProductId('');
        setSelectedQuantity(1);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'SDG' }).format(amount || 0);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full h-full flex flex-col sm:h-auto sm:max-h-[90vh] sm:max-w-4xl" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{sale ? 'تعديل فاتورة' : 'فاتورة بيع جديدة'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <ScrollArea className="flex-1 -m-6 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left side: Item selection and list */}
                            <div className='flex flex-col gap-4'>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Label htmlFor="product">المنتج</Label>
                                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                            <SelectTrigger id="product">
                                                <SelectValue placeholder="اختر المنتج" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.filter((p: any) => p.name.includes(searchTerm)).map((product: any) => (
                                                    <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="quantity">الكمية</Label>
                                        <Input id="quantity" type="number" min={1} value={selectedQuantity} onChange={e => setSelectedQuantity(Number(e.target.value))} />
                                    </div>
                                    <Button type="button" onClick={handleAddProduct} className="mb-1"><Plus size={18} /></Button>
                                </div>
                                <Input placeholder="بحث عن منتج..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>المنتج</TableHead>
                                                <TableHead>السعر</TableHead>
                                                <TableHead>الكمية</TableHead>
                                                <TableHead>الإجمالي</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fields.map((item, idx) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell>{formatCurrency(item.price)}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                                                    <TableCell><Button type="button" variant="destructive" onClick={() => remove(idx)}><Trash2 size={16} /></Button></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                            {/* Right side: Invoice details */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="invoiceNumber">رقم الفاتورة</Label>
                                        <Input id="invoiceNumber" value={sale ? sale.invoiceNumber : 'سيتم إنشاؤه تلقائياً'} readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="date">التاريخ</Label>
                                        <Input id="date" type="date" {...register('date')} />
                                    </div>
                                </div>

                                <Separator />
                                
                                <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                                    <div className="flex justify-between"><span>الإجمالي الفرعي</span><span>{formatCurrency(subtotal)}</span></div>
                                    <div className="flex justify-between"><span>الخصم</span><span className="text-destructive">-{formatCurrency(watchedDiscountType === 'percentage' ? subtotal * (watchedDiscount / 100) : watchedDiscount)}</span></div>
                                    <div className="flex justify-between"><span>الضريبة</span><span className="text-green-600">+{formatCurrency(subtotal * (watchedTax / 100))}</span></div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg"><span>الإجمالي</span><span>{formatCurrency(total)}</span></div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="discount">الخصم</Label>
                                        <Input id="discount" type="number" min={0} {...register('discount')} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="discountType">نوع الخصم</Label>
                                        <Select value={watchedDiscountType} onValueChange={v => setValue('discountType', v as any)}>
                                            <SelectTrigger id="discountType">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                                                <SelectItem value="percentage">نسبة مئوية</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="tax">الضريبة (%)</Label>
                                    <Input id="tax" type="number" min={0} {...register('tax')} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                                    <Select value={watch('paymentMethod')} onValueChange={v => setValue('paymentMethod', v)}>
                                        <SelectTrigger id="paymentMethod">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">نقداً</SelectItem>
                                            <SelectItem value="card">بطاقة</SelectItem>
                                            <SelectItem value="other">أخرى</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="mt-4">
                        <Button type="submit" disabled={isSubmitting}>{sale ? 'تحديث' : 'حفظ'}</Button>
                        <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 