import Dexie, { Table } from 'dexie';

export interface LocalProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  barcode?: string;
}

export interface LocalSale {
  id: string;
  date: string;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

class SalesSystemDB extends Dexie {
  products!: Table<LocalProduct, string>;
  sales!: Table<LocalSale, string>;

  constructor() {
    super('SalesSystemDB');
    this.version(1).stores({
      products: 'id',
      sales: 'id',
    });
  }
}

export const localDB = new SalesSystemDB();

// دوال عملية لإضافة وقراءة المنتجات والمبيعات
export async function addLocalProduct(product: LocalProduct) {
  console.log('[IndexedDB] إضافة منتج محلي:', product);
  await localDB.products.put(product);
}

export async function getAllLocalProducts(): Promise<LocalProduct[]> {
  const products = await localDB.products.toArray();
  console.log('[IndexedDB] جلب كل المنتجات المحلية:', products);
  return products;
}

export async function addLocalSale(sale: LocalSale) {
  console.log('[IndexedDB] إضافة فاتورة محلية:', sale);
  await localDB.sales.put(sale);
}

export async function getAllLocalSales(): Promise<LocalSale[]> {
  const sales = await localDB.sales.toArray();
  console.log('[IndexedDB] جلب كل الفواتير المحلية:', sales);
  return sales;
}
