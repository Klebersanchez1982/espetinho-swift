import { create } from 'zustand';
import { Order, OrderItem, Product, UserRole, INITIAL_PRODUCTS } from '@/types/restaurant';

interface RestaurantState {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  
  products: Product[];
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
  addOrder: (order) => set((s) => ({ orders: [...s.orders, order] })),
  addItemToOrder: (orderId, item) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId ? { ...o, items: [...o.items, item], status: 'andamento' as const } : o
      ),
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
      products: s.products.map((p) => {
        const order = s.orders.find((o) => o.id === orderId);
        if (!order) return p;
        const totalQty = order.items
          .filter((i) => i.productId === p.id)
          .reduce((sum, i) => sum + i.quantity, 0);
        return totalQty > 0 ? { ...p, stock: Math.max(0, p.stock - totalQty) } : p;
      }),
    })),
}));
