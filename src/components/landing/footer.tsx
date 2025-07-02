import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold font-headline text-foreground">
              MySales Hub
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MySales Hub. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
