/**
 * Client-side utility to track product interactions
 * Call this when users view, add to cart, or purchase products
 */

export async function trackInteraction(
  productId: string,
  actionType: 'VIEW' | 'ADD_TO_CART' | 'PURCHASE' | 'WISHLIST'
): Promise<void> {
  try {
    // Don't track if user is not authenticated (handled by API)
    const response = await fetch('/api/user/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        actionType,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to track interaction');
    }
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('Interaction tracking error:', error);
  }
}

/**
 * Track product view when component mounts
 */
export function useProductTracking(productId: string) {
  // Track view on mount
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback if available for non-blocking tracking
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => trackInteraction(productId, 'VIEW'));
    } else {
      // Fallback to timeout
      setTimeout(() => trackInteraction(productId, 'VIEW'), 1000);
    }
  }
}
