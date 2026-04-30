import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { supabase, formatR } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { Truck, Store, Clock, MapPin, CheckCircle2, ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const { setAuthOpen } = useUI();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [deliveryType, setDeliveryType] = useState(params.get('mode') === 'pickup' ? 'pickup' : 'delivery');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Cape Town');
  const [postal, setPostal] = useState('');
  const [phone, setPhone] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const deliveryFee =
    subtotal === 0 ? 0 : deliveryType === 'pickup' ? 20 : subtotal > 500 ? 0 : 45;
  const total = subtotal + deliveryFee;
  const eta = deliveryType === 'pickup' ? 20 : 45;

  const placeOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error('Your cart is empty');

    setPlacing(true);
    try {
      const orderPayload = {
        user_id: user ? user.id : null,
        status: 'confirmed',
        delivery_type: deliveryType,
        address: deliveryType === 'delivery' ? address : null,
        city: deliveryType === 'delivery' ? city : null,
        postal_code: deliveryType === 'delivery' ? postal : null,
        phone,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: 'cod',
        estimated_minutes: eta,
      };
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();
      if (orderErr || !order) throw new Error(orderErr?.message || 'Failed to create order');

      const itemRows = items.map((it) => ({
        order_id: order.id,
        product_id: it.id,
        product_name: it.name,
        price: it.price,
        quantity: it.quantity,
        image_url: it.image_url,
      }));
      const { error: itemErr } = await supabase.from('order_items').insert(itemRows);
      if (itemErr) throw new Error(itemErr.message);

      trackEvent('order_placed', {
        order_id: order.id,
        total: Number(total),
        item_count: items.length,
        delivery_type: deliveryType,
      });

      setPlacedOrder(order);
      clear();
    } catch (err) {
      toast.error(err?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <CheckCircle2 className="w-14 h-14 text-[#4a6741] mx-auto mb-4" />
        <h1 className="font-serif text-5xl text-[#f2f0e6]">Order confirmed</h1>
        <p className="text-[#a8a69c] mt-3">
          Order <span className="text-[#d69e4b] font-mono">#{placedOrder.id.slice(0, 8)}</span> is on its way.
        </p>
        <div className="card-surface rounded-xl p-6 mt-8 text-left">
          <div className="flex justify-between text-sm text-[#a8a69c] mb-2">
            <span>Estimated {placedOrder.delivery_type === 'pickup' ? 'pickup' : 'delivery'}</span>
            <span className="text-[#f2f0e6]">{placedOrder.estimated_minutes} min</span>
          </div>
          <div className="flex justify-between text-sm text-[#a8a69c] mb-2">
            <span>Payment</span>
            <span className="text-[#f2f0e6]">Cash on {placedOrder.delivery_type}</span>
          </div>
          <div className="flex justify-between text-lg font-serif mt-4 pt-4 border-t border-[#2d302a]">
            <span className="text-[#a8a69c]">Total</span>
            <span className="text-[#f2f0e6]">{formatR(placedOrder.total)}</span>
          </div>
        </div>
        <div className="flex gap-3 justify-center mt-8">
          <button
            data-testid="order-view-history-btn"
            onClick={() => nav('/orders')}
            className="btn-primary px-5 py-2.5 rounded-full text-sm"
          >
            View order history
          </button>
          <button
            onClick={() => nav('/')}
            className="px-5 py-2.5 rounded-full border border-[#2d302a] text-sm text-[#f2f0e6] hover:border-[#f2f0e6]"
          >
            Keep shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main data-testid="checkout-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        data-testid="checkout-back-btn"
        onClick={() => nav('/')}
        className="inline-flex items-center gap-2 text-sm text-[#a8a69c] hover:text-[#f2f0e6] mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to shop
      </button>
      <div className="mb-8">
        <div className="text-[#d69e4b] text-xs uppercase tracking-[0.25em]">Almost there</div>
        <h1 className="font-serif text-5xl text-[#f2f0e6] mt-2">Checkout</h1>
      </div>

      {items.length === 0 ? (
        <div className="card-surface rounded-xl p-12 text-center">
          <p className="text-[#a8a69c] mb-4">Your basket is empty.</p>
          <button onClick={() => nav('/')} className="btn-primary px-5 py-2.5 rounded-full">
            Browse produce
          </button>
        </div>
      ) : (
        <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            {!user && (
              <div
                data-testid="guest-banner"
                className="card-surface rounded-xl p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-[#d69e4b]" />
                  <div>
                    <div className="text-sm text-[#f2f0e6]">Checking out as guest</div>
                    <div className="text-xs text-[#a8a69c]">
                      Sign in to save this order to your history.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="checkout-signin-btn"
                  onClick={() => setAuthOpen(true)}
                  className="px-4 py-2 rounded-full text-xs btn-primary"
                >
                  Sign in
                </button>
              </div>
            )}
            <div className="card-surface rounded-xl p-6">
              <h3 className="font-serif text-2xl text-[#f2f0e6] mb-4">How would you like it?</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  data-testid="delivery-option-delivery"
                  onClick={() => setDeliveryType('delivery')}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition ${
                    deliveryType === 'delivery'
                      ? 'border-[#4a6741] bg-[#262924]'
                      : 'border-[#2d302a] hover:border-[#4a6741]'
                  }`}
                >
                  <Truck className="w-5 h-5 text-[#d69e4b]" />
                  <div className="text-left">
                    <div className="text-[#f2f0e6]">Delivery</div>
                    <div className="text-xs text-[#75746c]">45 min · R45 (free over R500)</div>
                  </div>
                </button>
                <button
                  type="button"
                  data-testid="delivery-option-pickup"
                  onClick={() => setDeliveryType('pickup')}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition ${
                    deliveryType === 'pickup'
                      ? 'border-[#4a6741] bg-[#262924]'
                      : 'border-[#2d302a] hover:border-[#4a6741]'
                  }`}
                >
                  <Store className="w-5 h-5 text-[#d69e4b]" />
                  <div className="text-left">
                    <div className="text-[#f2f0e6]">Pickup</div>
                    <div className="text-xs text-[#75746c]">Ready in 20 min · R20</div>
                  </div>
                </button>
              </div>
            </div>

            {deliveryType === 'delivery' && (
              <div className="card-surface rounded-xl p-6 space-y-3">
                <h3 className="font-serif text-2xl text-[#f2f0e6]">Delivery address</h3>
                <div className="flex items-center gap-2 text-xs text-[#d69e4b]">
                  <MapPin className="w-3.5 h-3.5" /> Cape Town metro · more areas coming soon
                </div>
                <input
                  data-testid="address-input"
                  required
                  placeholder="Street address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131412] border border-[#2d302a] rounded-lg text-[#f2f0e6] placeholder:text-[#75746c] focus:outline-none focus:border-[#4a6741]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    data-testid="city-input"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131412] border border-[#2d302a] rounded-lg text-[#f2f0e6] placeholder:text-[#75746c] focus:outline-none focus:border-[#4a6741]"
                  />
                  <input
                    data-testid="postal-input"
                    required
                    placeholder="Postal code"
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131412] border border-[#2d302a] rounded-lg text-[#f2f0e6] placeholder:text-[#75746c] focus:outline-none focus:border-[#4a6741]"
                  />
                </div>
              </div>
            )}

            <div className="card-surface rounded-xl p-6">
              <h3 className="font-serif text-2xl text-[#f2f0e6] mb-3">Contact</h3>
              <input
                data-testid="phone-input"
                required
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-[#131412] border border-[#2d302a] rounded-lg text-[#f2f0e6] placeholder:text-[#75746c] focus:outline-none focus:border-[#4a6741]"
              />
            </div>

            <div className="card-surface rounded-xl p-6">
              <h3 className="font-serif text-2xl text-[#f2f0e6] mb-3">Payment</h3>
              <div className="p-4 rounded-lg border border-[#4a6741] bg-[#262924] text-sm text-[#f2f0e6]">
                Cash on {deliveryType === 'delivery' ? 'delivery' : 'pickup'} · no online payment needed
              </div>
            </div>
          </div>

          <aside className="card-surface rounded-xl p-6 h-fit sticky top-24">
            <h3 className="font-serif text-2xl text-[#f2f0e6]">Order summary</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#a8a69c]">
              <Clock className="w-3.5 h-3.5" /> Estimated {eta} min
            </div>
            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-2">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 text-sm">
                  <img
                    src={it.image_url}
                    alt={it.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="text-[#f2f0e6]">{it.name}</div>
                    <div className="text-xs text-[#75746c]">
                      {it.quantity} × {formatR(it.price)}
                    </div>
                  </div>
                  <div className="text-[#f2f0e6]">{formatR(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 pt-4 border-t border-[#2d302a] text-sm">
              <div className="flex justify-between text-[#a8a69c]">
                <span>Subtotal</span>
                <span>{formatR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#a8a69c]">
                <span>{deliveryType === 'pickup' ? 'Pickup' : 'Delivery'} fee</span>
                <span>{deliveryFee === 0 ? 'Free' : formatR(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-serif text-xl text-[#f2f0e6] pt-2 border-t border-[#2d302a]">
                <span>Total</span>
                <span data-testid="checkout-total">{formatR(total)}</span>
              </div>
            </div>
            <button
              data-testid="place-order-btn"
              type="submit"
              disabled={placing}
              className="w-full btn-primary py-3.5 rounded-full text-sm mt-5 disabled:opacity-60"
            >
              {placing ? 'Placing order…' : `Place order · ${formatR(total)}`}
            </button>
          </aside>
        </form>
      )}
    </main>
  );
};

export default CheckoutPage;
