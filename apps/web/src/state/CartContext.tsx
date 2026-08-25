import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';
import type { Cart, CartItem, Product } from '../api/types';
import { useAuth } from './AuthContext';

const GUEST_CART_KEY = 'ateliedanay_guest_cart';

interface GuestCartItem {
  productId: string;
  product: Product;
  quantity: number;
  customizationValues: Record<string, string>;
}

export interface CartLine {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  customizationValues: Record<string, string>;
  priceCents: number;
}

function readGuestCart(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as GuestCartItem[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: GuestCartItem[]): void {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

interface CartContextValue {
  lines: CartLine[];
  isLoading: boolean;
  isGuest: boolean;
  totalCents: number;
  itemCount: number;
  addItem: (product: Product, quantity: number, customizationValues?: Record<string, string>) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [serverCart, setServerCart] = useState<Cart | null>(null);
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>(() => readGuestCart());
  const [isLoading, setIsLoading] = useState(true);
  const hasMergedRef = useRef(false);

  const loadServerCart = useCallback(async () => {
    const data = await api.get<{ cart: Cart }>('/api/cart');
    setServerCart(data.cart);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      hasMergedRef.current = false;
      setServerCart(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      if (!hasMergedRef.current) {
        hasMergedRef.current = true;
        const pending = readGuestCart();
        if (pending.length > 0) {
          try {
            await api.post('/api/cart/merge', {
              items: pending.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                customizationValues: item.customizationValues,
              })),
            });
          } catch {
            // If the merge fails, keep the guest cart intact so nothing is lost.
          }
          writeGuestCart([]);
          setGuestItems([]);
        }
      }
      try {
        await loadServerCart();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, loadServerCart]);

  const addItem = useCallback(
    async (product: Product, quantity: number, customizationValues: Record<string, string> = {}) => {
      if (user) {
        await api.post('/api/cart/items', { productId: product.id, quantity, customizationValues });
        await loadServerCart();
        return;
      }
      setGuestItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.productId === product.id &&
            JSON.stringify(item.customizationValues) === JSON.stringify(customizationValues),
        );
        let next: GuestCartItem[];
        if (existingIndex >= 0) {
          next = [...prev];
          next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + quantity };
        } else {
          next = [...prev, { productId: product.id, product, quantity, customizationValues }];
        }
        writeGuestCart(next);
        return next;
      });
    },
    [user, loadServerCart],
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (user) {
        await api.patch(`/api/cart/items/${lineId}`, { quantity });
        await loadServerCart();
        return;
      }
      setGuestItems((prev) => {
        const next = prev.map((item) => (item.productId === lineId ? { ...item, quantity } : item));
        writeGuestCart(next);
        return next;
      });
    },
    [user, loadServerCart],
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (user) {
        await api.delete(`/api/cart/items/${lineId}`);
        await loadServerCart();
        return;
      }
      setGuestItems((prev) => {
        const next = prev.filter((item) => item.productId !== lineId);
        writeGuestCart(next);
        return next;
      });
    },
    [user, loadServerCart],
  );

  const refresh = useCallback(async () => {
    if (user) await loadServerCart();
  }, [user, loadServerCart]);

  const lines: CartLine[] = useMemo(() => {
    if (user) {
      return (serverCart?.items ?? []).map((item: CartItem) => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        customizationValues: item.customizationValues,
        priceCents: item.priceCentsSnapshot,
      }));
    }
    return guestItems.map((item) => ({
      id: item.productId,
      productId: item.productId,
      product: item.product,
      quantity: item.quantity,
      customizationValues: item.customizationValues,
      priceCents: item.product.priceCents,
    }));
  }, [user, serverCart, guestItems]);

  const totalCents = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <CartContext.Provider
      value={{ lines, isLoading, isGuest: !user, totalCents, itemCount, addItem, updateQuantity, removeItem, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
