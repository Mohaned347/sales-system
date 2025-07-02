export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  barcode: string;
}

export interface SaleItem {
  productId: string;
  name: string; // Snapshot of name at time of sale
  price: number; // Snapshot of price at time of sale
  quantity: number;
}

export interface SaleReturn {
  productId: string;
  quantity: number;
  date: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  items: SaleItem[];
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  tax: number;
  total: number;
  paymentMethod: string;
  userId?: string; // Optional user ID
  returns?: SaleReturn[];
}

export interface AppContextType {
  products: Product[];
  sales: Sale[];
  loading: boolean;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  addSale: (saleData: Omit<Sale, 'id'>) => Promise<void>;
  updateSale: (id: string, saleData: Partial<Omit<Sale, 'id'>>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  returnProduct: (returnData: { saleId: string; productId: string; quantity: number }) => Promise<void>;
  refreshData: () => void;
}
