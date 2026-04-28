import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBasket, Trash2, Truck, Store } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatR } from '@/lib/supabase';

const CartDrawer = () => {
  const { items, open, setOpen, updateQty, remove, subtotal } = useCart();
  const nav = useNavigate();
  const [mode, setMode] = useState('delivery');
  const delivery =
    subtotal === 0 ? 0 : mode === 'pickup' ? 20 : subtotal > 500 ? 0 : 45;
  const total = subtotal + delivery;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        data-testid="cart-drawer"
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-[#1c1e1b] border-l border-[#2d302a] z-50 flex flex-col transition-transform duration-500 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2d302a]">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#75746c]">Your basket</div>
            <h3 className="font-serif text-2xl text-[#f2f0e6]">
              {items.length === 0 ? 'Empty' : `${items.length} item${items.length > 1 ? 's' : ''}`}
            </h3>
          </div>
          <button
            data-testid="cart-close-btn"
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-[#262924] text-[#a8a69c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBasket className="w-12 h-12 text-[#2d302a] mb-4" />
              <p className="text-[#a8a69c] mb-4">Your basket is still waiting.</p>
              <button
                onClick={() => setOpen(false)}
                className="btn-primary px-5 py-2.5 rounded-full text-sm"
              >
                Browse produce
              </button>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                data-testid={`cart-item-${it.id}`}
                className="flex gap-3 card-surface rounded-xl p-3"
              >
                <img
                  src={it.image_url}
                  alt={it.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-[#75746c]">
                    {it.unit}
                  </div>
                  <h4 className="font-serif text-base text-[#f2f0e6] truncate">{it.name}</h4>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      data-testid={`cart-dec-${it.id}`}
                      onClick={() => updateQty(it.id, it.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-[#262924] hover:bg-[#2d302a] flex items-center justify-center text-[#f2f0e6]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm text-[#f2f0e6]">
                      {it.quantity}
                    </span>
                    <button
                      data-testid={`cart-inc-${it.id}`}
                      onClick={() => updateQty(it.id, it.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-[#262924] hover:bg-[#2d302a] flex items-center justify-center text-[#f2f0e6]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      data-testid={`cart-remove-${it.id}`}
                      onClick={() => remove(it.id)}
                      title="Remove"
                      className="ml-auto text-[#75746c] hover:text-[#c36a4e]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-lg text-[#f2f0e6]">
                    {formatR(it.price * it.quantity)}
                  </div>
                  <div className="text-xs text-[#75746c]">{formatR(it.price)} each</div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#2d302a] p-6 space-y-3 bg-[#131412]">
            <div className="grid grid-cols-2 gap-2">
              <button
                data-testid="cart-mode-delivery"
                type="button"
                onClick={() => setMode('delivery')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition ${
                  mode === 'delivery'
                    ? 'border-[#4a6741] bg-[#262924] text-[#f2f0e6]'
                    : 'border-[#2d302a] text-[#a8a69c] hover:border-[#4a6741]'
                }`}
              >
                <Truck className="w-4 h-4 text-[#d69e4b]" />
                <div className="text-left leading-tight">
                  <div>Delivery</div>
                  <div className="text-[10px] text-[#75746c]">
                    {subtotal > 500 ? 'Free' : 'R45 (free >R500)'}
                  </div>
                </div>
              </button>
              <button
                data-testid="cart-mode-pickup"
                type="button"
                onClick={() => setMode('pickup')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition ${
                  mode === 'pickup'
                    ? 'border-[#4a6741] bg-[#262924] text-[#f2f0e6]'
                    : 'border-[#2d302a] text-[#a8a69c] hover:border-[#4a6741]'
                }`}
              >
                <Store className="w-4 h-4 text-[#d69e4b]" />
                <div className="text-left leading-tight">
                  <div>Pickup</div>
                  <div className="text-[10px] text-[#75746c]">R20 · 20 min</div>
                </div>
              </button>
            </div>
            <div className="flex justify-between text-sm text-[#a8a69c]">
              <span>Subtotal</span>
              <span data-testid="cart-subtotal">{formatR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#a8a69c]">
              <span>{mode === 'pickup' ? 'Pickup fee' : 'Delivery fee'}</span>
              <span>{delivery === 0 ? 'Free' : formatR(delivery)}</span>
            </div>
            <div className="h-px bg-[#2d302a]" />
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-widest text-[#75746c]">Total</span>
              <span
                data-testid="cart-total"
                className="font-serif text-3xl text-[#f2f0e6]"
              >
                {formatR(total)}
              </span>
            </div>
            <button
              data-testid="cart-checkout-btn"
              onClick={() => {
                setOpen(false);
                nav(`/checkout?mode=${mode}`);
              }}
              className="w-full btn-primary py-3.5 rounded-full text-sm tracking-wide mt-2"
            >
              Go to checkout
            </button>
            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-[#a8a69c] hover:text-[#f2f0e6]"
            >
              or continue shopping
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
