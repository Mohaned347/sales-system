"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '../ui/skeleton';

const RatingStars = ({ rating, className }: { rating: number, className?: string }) => {
  return (
    <div className={`flex ${className}`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`}
        />
      ))}
    </div>
  );
};


export default function Testimonials() {
  const { testimonials, loading } = useAppContext();

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">
            ماذا يقول عملاؤنا السعداء
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            نحن نفخر ببناء علاقات قوية مع عملائنا ومساعدتهم على تحقيق أهدافهم.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="flex flex-col justify-between shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-[150px]" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-4/5 mb-4" />
                        <Skeleton className="h-5 w-28" />
                    </CardContent>
                </Card>
             ))
          ) : testimonials.length > 0 ? (
            testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person face" />
                      <AvatarFallback>{testimonial.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <blockquote className="italic text-foreground/80">
                    {testimonial.quote}
                  </blockquote>
                  <RatingStars rating={testimonial.rating} className="mt-4" />
                </CardContent>
              </Card>
            ))
          ) : (
            <p className='text-center col-span-3 text-muted-foreground'>لا توجد آراء متاحة حالياً.</p>
          )}
        </div>
      </div>
    </section>
  );
}
