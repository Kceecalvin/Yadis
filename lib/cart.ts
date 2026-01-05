export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(item: Omit<CartItem, 'quantity'>): void {
  const cart = getCart();
  const existingItem = cart.find(i => i.id === item.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  
  saveCart(cart);
  window.dispatchEvent(new Event('cartUpdated'));
}

export function removeFromCart(id: string): void {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  window.dispatchEvent(new Event('cartUpdated'));
}

export function updateQuantity(id: string, quantity: number): void {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      item.quantity = quantity;
      saveCart(cart);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }
}

export function getCartTotal(): number {
  return getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function getCartCount(): number {
  return getCart().reduce((count, item) => count + item.quantity, 0);
}

export function clearCart(): void {
  saveCart([]);
  window.dispatchEvent(new Event('cartUpdated'));
}
