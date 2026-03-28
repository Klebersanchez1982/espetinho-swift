import { create } from 'zustand';
import { Order, OrderItem, Product, UserRole, INITIAL_PRODUCTS } from '@/types/restaurant';

interface RestaurantState {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  
  products: Product[];
  addProduct: (product: Product) => void;
  updateProductStock: (productId: string, qty: number) => void;
  toggleProductAvailability: (productId: string) => void;
  
  orders: Order[];
  addOrder: (order: Order) => void;
  addItemToOrder: (orderId: string, item: OrderItem) => void;
  removeItemFromOrder: (orderId: string, itemId: string) => void;
  updateItemStatus: (orderId: string, itemId: string, status: OrderItem['status']) => void;
  closeOrder: (orderId: string, paymentMethod: Order['paymentMethod'], totalPaid: number) => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
  
  products: INITIAL_PRODUCTS,
  addProduct: (product) => set((s) => ({ products: [...s.products, product] })),
  updateProductStock: (productId, qty) =>
    set((s) => ({
      products: s.products.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + qty) } : p
      ),
    })),
  toggleProductAvailability: (productId) =>
    set((s) => ({
      products: s.products.map((p) =>
        p.id === productId ? { ...p, available: !p.available } : p
      ),
    })),

  orders: [],
  addOrder: (order) => set((s) => ({
    orders: [...s.orders, order],
    // Auto deduct stock
    products: s.products.map((p) => {
      const totalQty = order.items
        .filter((i) => i.productId === p.id)
        .reduce((sum, i) => sum + i.quantity, 0);
      if (totalQty > 0) {
        const newStock = Math.max(0, p.stock - totalQty);
        return { ...p, stock: newStock, available: newStock > 0 ? p.available : false };
      }
      return p;
    }),
  })),
  addItemToOrder: (orderId, item) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId ? { ...o, items: [...o.items, item], status: 'andamento' as const } : o
      ),
      // Auto deduct stock for added item
      products: s.products.map((p) => {
        if (p.id === item.productId) {
          const newStock = Math.max(0, p.stock - item.quantity);
          return { ...p, stock: newStock, available: newStock > 0 ? p.available : false };
        }
        return p;
      }),
    })),
  removeItemFromOrder: (orderId, itemId) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId ? { ...o, items: o.items.filter((i) => i.id !== itemId) } : o
      ),
    })),
  updateItemStatus: (orderId, itemId, status) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId
          ? { ...o, items: o.items.map((i) => (i.id === itemId ? { ...i, status } : i)) }
          : o
      ),
    })),
  closeOrder: (orderId, paymentMethod, totalPaid) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'fechada' as const, paymentMethod, totalPaid, closedAt: new Date() }
          : o
      ),
    })),
}));
