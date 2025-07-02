"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import { Plus, Minus, Trash2, Search, Percent, AlertCircle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

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
        if (isOpen) {
            if (sale) {
                reset({
                    ...sale,
                    date: new Date(sale.date).toISOString().split('T')[0],
                });
            } else {
                // Set default date only on client-side when modal opens for a new sale
                reset({
                    invoiceNumber: undefined,
                    date: new Date().toISOString().split('T')[0],
                    items: [],
                    discount: 0,
                    discountType: 'fixed',
                    tax: 0,
                    paymentMethod: 'cash'
                });
            }
        }
    }, [sale, isOpen, reset]);

    const handleAddItem = () => {
        if (!selectedProductId) {
            toast({ variant: 'destructive', title: 'الرجاء اختيار منتج' });
            return;
        }

        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        const existingItemIndex = fields.findIndex(item => item.productId === selectedProductId);
        
        const availableStock = product.stock - (existingItemIndex > -1 ? fields[existingItemIndex].quantity : 0);
        
        if (selectedQuantity > availableStock) {
            toast({ variant: 'destructive', title: 'الكمية المطلوبة غير متوفرة', description: `المخزون المتاح: ${product.stock}` });
            return;
        }

        if (existingItemIndex > -1) {
            const newQty = fields[existingItemIndex].quantity + selectedQuantity;
            if(newQty > product.stock) {
                toast({ variant: 'destructive', title: 'الكمية الإجمالية تتجاوز المخزون' });
                return;
            }
            update(existingItemIndex, { ...fields[existingItemIndex], quantity: newQty });
        } else {
            append({ productId: product.id, name: product.name, price: product.price, quantity: selectedQuantity });
        }
        
        setSelectedProductId('');
        setSelectedQuantity(1);
        setSearchTerm('');
    };

    const handleFormSubmit: SubmitHandler<SaleFormValues> = async (data) => {
        const finalData = { ...data, subtotal, total };
        await onSubmit(finalData);
    };
    
    const filteredProducts = products.filter(p => 
        (p.stock > 0 || fields.some(i => i.productId === p.id)) && // show products in cart even if stock becomes 0
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode?.includes(searchTerm))
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{sale ? 'تعديل فاتورة' : 'فاتورة بيع جديدة'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh]">
                    {/* Left side: Item selection and list */}
                    <div className='flex flex-col gap-4'>
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="font-semibold">إضافة منتجات</h3>
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="بحث بالاسم أو الباركود..."
                                    className="pr-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Controller
                                    control={control}
                                    name="items"
                                    render={() => (
                                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                            <SelectTrigger className="col-span-3 sm:col-span-2">
                                                <SelectValue placeholder="اختر منتج" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredProducts.map(p => {
                                                    const itemInCart = fields.find(i => i.productId === p.id);
                                                    const availableStock = p.stock - (itemInCart?.quantity || 0);
                                                    return (
                                                        <SelectItem key={p.id} value={p.id} disabled={availableStock <= 0 && !itemInCart}>
                                                            {p.name} ({formatCurrency(p.price)}) - المخزون: {p.stock}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <Input type="number" value={selectedQuantity} onChange={(e) => setSelectedQuantity(Number(e.target.value))} min={1} />
                            </div>
                            <Button type="button" onClick={handleAddItem} className="w-full" disabled={!selectedProductId}>
                                <Plus className="ml-2 h-4 w-4" /> إضافة للفاتورة
                            </Button>
                        </div>
                        <ScrollArea className="border rounded-lg h-64">
                            <div className="p-4 space-y-2">
                            {fields.length === 0 && <p className="text-center text-muted-foreground py-10">لم تتم إضافة منتجات بعد</p>}
                            {fields.map((item, index) => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            className="w-16 h-8 text-center"
                                            min={1}
                                            {...register(`items.${index}.quantity`)}
                                        />
                                        <Button type="button" variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </ScrollArea>
                        {errors.items && <p className="text-destructive text-sm">{errors.items.message || errors.items.root?.message}</p>}
                    </div>

                    {/* Right side: Invoice details */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                        
                        <div className="space-y-2 p-4 border rounded-lg">
                             <div className="flex justify-between"><span>الإجمالي الفرعي</span><span>{formatCurrency(subtotal)}</span></div>
                             <div className="flex justify-between"><span>الخصم</span><span className="text-destructive">-{formatCurrency(watchedDiscountType === 'percentage' ? subtotal * (watchedDiscount / 100) : watchedDiscount)}</span></div>
                             <div className="flex justify-between"><span>الضريبة</span><span className="text-green-600">+{formatCurrency(subtotal * (watchedTax / 100))}</span></div>
                             <Separator />
                             <div className="flex justify-between font-bold text-lg"><span>الإجمالي</span><span>{formatCurrency(total)}</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>الخصم</Label>
                                <div className="flex">
                                    <Input type="number" {...register('discount')} />
                                    <Select value={watchedDiscountType} onValueChange={(val: 'fixed' | 'percentage') => setValue('discountType', val)}>
                                        <SelectTrigger className="w-[80px] shrink-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed">ج.س</SelectItem>
                                            <SelectItem value="percentage">%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="tax">الضريبة (%)</Label>
                                <Input id="tax" type="number" {...register('tax')} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>طريقة الدفع</Label>
                            <Controller
                                control={control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">نقدي</SelectItem>
                                            <SelectItem value="card">بطاقة</SelectItem>
                                            <SelectItem value="bank">تحويل بنكي</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'جاري الحفظ...' : 'حفظ الفاتورة'}</Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('ar-SD').format(amount || 0);
}
