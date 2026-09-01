import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import ProductGraphic from './ProductGraphic';
import { useCart } from '../context/CartContext';
import Button from './Button';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems: propsCartItems,
  onUpdateQuantity: propsUpdateQuantity,
  onRemoveItem: propsRemoveItem,
  onCheckout: propsCheckout,
  onOpenFullCart,
  onSelectProduct,
  theme
}) {
  const context = useCart();

  const cartItems = propsCartItems || context.cartItems;
  const onUpdateQuantity = propsUpdateQuantity || context.updateQuantity;
  const onRemoveItem = propsRemoveItem || context.removeItem;
  const subtotal = context.subtotal || cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!isOpen) return null;

  const freeShippingThreshold = context.freeShippingThreshold || 1499;
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleCheckoutClick = () => {
    if (onOpenFullCart) {
      onOpenFullCart();
      onClose();
    } else if (propsCheckout) {
      propsCheckout(subtotal + (subtotal >= freeShippingThreshold ? 0 : 99));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--bg-main)] border-l border-[var(--border-subtle)] text-[var(--text-main)] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FF1E27]" />
              <h3 className="text-lg font-sans font-black italic uppercase tracking-wider text-[var(--text-main)]">YOUR CART</h3>
              <span className="text-xs bg-[#FF1E27] text-white px-2 py-0.5 rounded-full font-bold">
                {cartItems.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[var(--text-sub)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-6 py-3 bg-[var(--bg-main)] border-b border-[var(--border-subtle)] space-y-1.5 text-left">
            <p className="text-xs text-[var(--text-sub)]">
              {subtotal >= freeShippingThreshold ? (
                <span className="text-[#FF1E27] font-bold">🎉 Congratulations! You unlocked FREE Express Shipping!</span>
              ) : (
                <>Add <span className="font-bold text-[var(--text-main)]">₹{freeShippingThreshold - subtotal}</span> more to unlock <span className="text-[#FF1E27] font-bold">FREE Shipping</span></>
              )}
            </p>
            <div className="w-full h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-[#FF1E27] transition-all duration-300 rounded-full"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[var(--text-sub)]">
                <ShoppingBag className="w-16 h-16 text-[var(--text-sub)] stroke-[1.5]" />
                <p className="text-base font-medium">Your cart is currently empty.</p>
                <Button
                  onClick={onClose}
                  variant="primary" size="md"
                >
                  START SHOPPING
                </Button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id || item.itemId || item.productId}
                  className="glass-panel p-3.5 rounded-xl flex items-center gap-4 border border-[var(--border-subtle)] opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div
                    onClick={() => {
                      if (onClose) onClose();
                      if (onSelectProduct) onSelectProduct(item);
                    }}
                    className="cursor-pointer shrink-0 group/img"
                  >
                    <ProductGraphic
                      image={item.image}
                      imageLight={item.imageLight}
                      type={item.imageType}
                      theme={theme}
                      className="w-16 h-16 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] group-hover/img:scale-105 transition-transform"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 text-left space-y-1">
                    <h4
                      onClick={() => {
                        if (onClose) onClose();
                        if (onSelectProduct) onSelectProduct(item);
                      }}
                      className="text-xs sm:text-sm font-black font-sans italic uppercase tracking-wider text-[var(--text-main)] hover:text-[#FF1E27] transition-colors leading-tight line-clamp-2 cursor-pointer"
                    >
                      {item.name}
                    </h4>
                    
                    <div className="text-[10px] text-[var(--text-sub)] font-mono flex items-center gap-1.5 flex-wrap">
                      {item.selectedSize && <span className="bg-[var(--bg-main)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{item.selectedSize}</span>}
                      {item.selectedColor && <span className="bg-[var(--bg-main)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{item.selectedColor}</span>}
                    </div>

                    <p className="text-xs font-bold text-[#FF1E27]">
                      ₹{item.price}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-[var(--border-subtle)] rounded-md bg-[var(--bg-main)]">
                        <button
                          onClick={() => onUpdateQuantity(item.id || item.itemId || item.productId, item.quantity - 1)}
                          className="px-2 py-0.5 text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold font-heading text-[var(--text-main)]">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id || item.itemId || item.productId, item.quantity + 1)}
                          disabled={item.quantity >= (item.stockQuantity || 10)}
                          className="px-2 py-0.5 text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      

                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end space-y-3 sm:space-y-4">
                    <div>
                      <span className="text-sm sm:text-base font-black font-heading text-[#FF1E27] block">
                        ₹{item.price * item.quantity}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-[var(--text-sub)] block font-medium">
                          ₹{item.price} ea
                        </span>
                      )}
                    </div>

                    {/* Remove Button directly underneath Price Area */}
                    <button
                      onClick={() => onRemoveItem(item.id || item.itemId || item.productId)}
                      className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-[#FF1E27] border border-red-500/30 hover:border-red-500/60 transition-all text-[10px] font-extrabold uppercase tracking-wider cursor-pointer group/rem shadow-sm"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3 h-3 group-hover/rem:scale-110 transition-transform" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-main)] space-y-4">
              <div className="space-y-1.5 text-xs text-[var(--text-sub)]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[var(--text-main)] font-bold font-heading">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-[var(--text-main)]">{subtotal >= freeShippingThreshold ? 'FREE' : '₹99'}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[var(--text-main)] pt-2 border-t border-[var(--border-subtle)] font-heading">
                  <span>TOTAL</span>
                  <span className="text-[#FF1E27]">₹{subtotal + (subtotal >= freeShippingThreshold ? 0 : 99)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckoutClick}
                variant="primary" fullWidth
              >
                <span>VIEW FULL CART & CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--text-sub)] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF1E27]" />
                <span>Synchronized with Global Cart State & API</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
