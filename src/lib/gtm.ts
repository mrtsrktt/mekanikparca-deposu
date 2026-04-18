export const pushToDataLayer = (event: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(event);
  }
};

export const trackPurchase = (value: number = 500, orderId?: string) => {
  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: orderId || `order_${Date.now()}`,
      value: value,
      currency: 'TRY'
    }
  });
};

export const trackAddToCart = (productName?: string, productId?: string, price?: number) => {
  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'TRY',
      value: price || 0,
      items: [{
        item_id: productId,
        item_name: productName,
        price: price
      }]
    }
  });
};

export const trackWhatsAppClick = (location: string) => {
  pushToDataLayer({
    event: 'whatsapp_click',
    click_location: location
  });
};
