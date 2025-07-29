'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X, Eye } from 'lucide-react';
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Testimonial {
  id: string;
  name: string;
  title: string;
  quote: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  email?: string;
  phone?: string;
}

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const { toast } = useToast();

  const fetchTestimonials = async () => {
    try {
      const testimonialsRef = collection(db, 'testimonials');
      const snapshot = await getDocs(testimonialsRef);
      const testimonialsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Testimonial[];
      
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({ variant: 'destructive', title: 'خطأ في جلب التقييمات' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleStatusUpdate = async (testimonialId: string, status: 'approved' | 'rejected') => {
    try {
      const testimonialRef = doc(db, 'testimonials', testimonialId);
      await updateDoc(testimonialRef, { status });
      
      setTestimonials(prev => 
        prev.map(testimonial => 
          testimonial.id === testimonialId 
            ? { ...testimonial, status }
            : testimonial
        )
      );
      
      toast({ 
        title: status === 'approved' ? 'تم قبول التقييم' : 'تم رفض التقييم',
        description: status === 'approved' ? 'سيظهر التقييم في الصفحة الرئيسية' : 'تم رفض التقييم بنجاح'
      });
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast({ variant: 'destructive', title: 'خطأ في تحديث التقييم' });
    }
  };

  const handleDelete = async (testimonialId: string) => {
    try {
      await deleteDoc(doc(db, 'testimonials', testimonialId));
      setTestimonials(prev => prev.filter(t => t.id !== testimonialId));
      toast({ title: 'تم حذف التقييم بنجاح' });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({ variant: 'destructive', title: 'خطأ في حذف التقييم' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">في الانتظار</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">معتمد</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'غير محدد';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ar-SA');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>إدارة التقييمات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>إدارة التقييمات</span>
          <Badge variant="outline">{testimonials.length} تقييم</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {testimonials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد تقييمات حالياً
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      {getStatusBadge(testimonial.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{testimonial.title}</p>
                    <RatingStars rating={testimonial.rating} />
                    <p className="text-sm text-muted-foreground mt-2">
                      {formatDate(testimonial.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTestimonial(testimonial)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>تفاصيل التقييم</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold">{testimonial.name}</h4>
                            <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                          </div>
                          <RatingStars rating={testimonial.rating} />
                          <blockquote className="italic border-r-4 border-primary pr-4">
                            "{testimonial.quote}"
                          </blockquote>
                          {testimonial.email && (
                            <p className="text-sm"><strong>البريد الإلكتروني:</strong> {testimonial.email}</p>
                          )}
                          {testimonial.phone && (
                            <p className="text-sm"><strong>الهاتف:</strong> {testimonial.phone}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            تاريخ الإرسال: {formatDate(testimonial.createdAt)}
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {testimonial.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(testimonial.id, 'approved')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(testimonial.id, 'rejected')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      حذف
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-sm">{testimonial.quote}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 