import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, formatR } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { Package, Clock, ArrowLeft } from 'lucide-react';

const statusColor = {
  pending: '#d69e4b',
  confirmed: '#4a6741',
  out_for_delivery: '#c36a4e',
  delivered: '#4a6741',
  cancelled: '#75746c',
};

const OrdersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { setAuthOpen } = useUI();
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setAuthOpen(true); nav('/'); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    })();
  }, [user, authLoading]);

  if (!user) return null;

  return (
    <main data-testid="orders-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        data-testid="orders-back-btn"
        onClick={() => nav('/')}
        className="inline-flex items-center gap-2 text-sm text-[#a8a69c] hover:text-[#f2f0e6] mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to shop
      </button>
      <div className="mb-10">
        <div className="text-[#d69e4b] text-xs uppercase tracking-[0.25em]">Your history</div>
        <h1 className="font-serif text-5xl text-[#f2f0e6] mt-2">Orders</h1>
      </div>

      {loading ? (
        <div className="card-surface rounded-xl p-12 text-[#a8a69c]">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="card-surface rounded-xl p-12 text-center">
          <Package className="w-10 h-10 mx-auto text-[#2d302a] mb-3" />
          <p className="text-[#a8a69c]">No orders yet.</p>
          <button onClick={() => nav('/')} className="btn-primary px-5 py-2.5 rounded-full mt-4">
            Start shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              data-testid={`order-row-${o.id}`}
              className="card-surface rounded-xl p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-[#75746c] uppercase tracking-widest">
                    {new Date(o.created_at).toLocaleString('en-ZA')}
                  </div>
                  <div className="font-mono text-sm text-[#d69e4b]">#{o.id.slice(0, 8)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border"
                      style={{ borderColor: statusColor[o.status] || '#2d302a', color: statusColor[o.status] || '#a8a69c' }}
                    >
                      {o.status.replaceAll('_', ' ')}
                    </span>
                    <span className="text-xs text-[#a8a69c] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {o.estimated_minutes} min {o.delivery_type}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-2xl text-[#f2f0e6]">{formatR(o.total)}</div>
                  <div className="text-xs text-[#75746c]">{o.order_items?.length || 0} items</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#2d302a] flex gap-3 flex-wrap">
                {o.order_items?.map((it) => (
                  <div key={it.id} className="flex items-center gap-2 bg-[#262924] rounded-full pr-3 pl-1 py-1">
                    <img src={it.image_url} alt={it.product_name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs text-[#f2f0e6]">
                      {it.product_name} × {it.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default OrdersPage;
