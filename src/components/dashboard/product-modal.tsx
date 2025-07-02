"use client"

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Product } from '@/types';

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

const formSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  price: z.coerce.number().min(0, 'السعر يجب أن يكون رقماً موجباً'),
  stock: z.coerce.number().int().min(0, 'المخزون يجب أن يكون رقماً صحيحاً موجباً'),
  category: z.string().optional(),
  barcode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
  product: Omit<Product, 'id'> & { id?: string } | null;
}

export default function ProductModal({ isOpen, onClose, onSubmit, product }: ProductModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name || '',
          price: product.price || 0,
          stock: product.stock || 0,
          category: product.category || '',
          barcode: product.barcode || '',
        });
      } else {
        reset({
          name: '',
          price: 0,
          stock: 0,
          category: '',
          barcode: '',
        });
      }
    }
  }, [product, isOpen, reset]);

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
          <DialogDescription>
            {product ? 'قم بتحديث تفاصيل المنتج أدناه.' : 'أدخل تفاصيل المنتج الجديد أدناه.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">الاسم</Label>
              <div className="col-span-3">
                <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">السعر</Label>
              <div className="col-span-3">
                <Input id="price" type="number" step="0.01" {...register('price')} className={errors.price ? 'border-destructive' : ''} />
                {errors.price && <p className="text-destructive text-xs mt-1">{errors.price.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">المخزون</Label>
              <div className="col-span-3">
                <Input id="stock" type="number" {...register('stock')} className={errors.stock ? 'border-destructive' : ''} />
                {errors.stock && <p className="text-destructive text-xs mt-1">{errors.stock.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">الفئة</Label>
              <Input id="category" {...register('category')} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right">الباركود</Label>
              <Input id="barcode" {...register('barcode')} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit">{product ? 'حفظ التغييرات' : 'إضافة المنتج'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
