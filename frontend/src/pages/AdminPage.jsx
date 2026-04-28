import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, formatR } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Package2, Plus, Pencil, Trash2, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const StatCard = ({ icon: Icon, label, value, hint, accent = '#4a6741' }) => (
  <div className="card-surface rounded-xl p-5">
    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#75746c]">
      <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
      {label}
    </div>
    <div className="font-serif text-3xl text-[#f2f0e6] mt-2">{value}</div>
    {hint && <div className="text-xs text-[#a8a69c] mt-1">{hint}</div>}
  </div>
);

const AdminPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile) return;
    if (!profile.is_admin) { toast.error('Admin access required'); nav('/'); return; }
    load();
  }, [user, profile, authLoading]);

  const load = async () => {
    setLoading(true);
    const [{ data: o }, { data: p }] = await Promise.all([
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
    ]);
    setOrders(o || []);
    setProducts(p || []);
    setLoading(false);
  };

  const stats = useMemo(() => {
    const rev = orders.reduce((s, o) => s + Number(o.total), 0);
    const byDay = {};
    for (const o of orders) {
      const d = new Date(o.created_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
      byDay[d] = (byDay[d] || 0) + Number(o.total);
    }
    const revSeries = Object.entries(byDay).reverse().slice(-14).map(([name, v]) => ({ name, v }));
    const counts = {};
    for (const o of orders) for (const it of o.order_items || []) counts[it.product_name] = (counts[it.product_name] || 0) + it.quantity;
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, v]) => ({ name, v }));
    return { rev, orders: orders.length, revSeries, top, avg: orders.length ? rev / orders.length : 0 };
  }, [orders]);

  const saveProduct = async (data) => {
    const payload = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
      stock: Number(data.stock),
      unit: data.unit,
      image_url: data.image_url,
      is_organic: data.is_organic,
      is_best_seller: data.is_best_seller,
      is_new_arrival: data.is_new_arrival,
      is_limited_deal: data.is_limited_deal,
    };
    let resp;
    if (data.id) resp = await supabase.from('products').update(payload).eq('id', data.id);
    else resp = await supabase.from('products').insert(payload);
    if (resp.error) return toast.error(resp.error.message);
    toast.success('Saved');
    setEditing(null);
    load();
  };

  const delProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  if (!user || !profile?.is_admin) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-4xl text-[#f2f0e6]">Admin only</h1>
        <p className="text-[#a8a69c] mt-2">
          Ask a superuser to flip <code className="text-[#d69e4b]">profiles.is_admin = true</code> for your account.
        </p>
      </main>
    );
  }

  return (
    <main data-testid="admin-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        data-testid="admin-back-btn"
        onClick={() => nav('/')}
        className="inline-flex items-center gap-2 text-sm text-[#a8a69c] hover:text-[#f2f0e6] mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to shop
      </button>
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-[#d69e4b] text-xs uppercase tracking-[0.25em]">Admin</div>
          <h1 className="font-serif text-5xl text-[#f2f0e6] mt-2">Dashboard</h1>
        </div>
        <button
          data-testid="admin-add-product-btn"
          onClick={() => setEditing({})}
          className="btn-primary px-4 py-2.5 rounded-full text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New product
        </button>
      </div>

      {loading ? (
        <div className="text-[#a8a69c]">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={DollarSign} label="Revenue" value={formatR(stats.rev)} hint="all time" accent="#d69e4b" />
            <StatCard icon={ShoppingBag} label="Orders" value={stats.orders} hint="completed" />
            <StatCard icon={TrendingUp} label="Avg order" value={formatR(stats.avg)} accent="#c36a4e" />
            <StatCard icon={Package2} label="SKUs" value={products.length} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-10">
            <div className="card-surface rounded-xl p-6">
              <h3 className="font-serif text-2xl text-[#f2f0e6] mb-4">Revenue trend</h3>
              {stats.revSeries.length === 0 ? (
                <div className="text-[#75746c] text-sm">No orders yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats.revSeries}>
                    <CartesianGrid stroke="#2d302a" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#75746c" fontSize={11} />
                    <YAxis stroke="#75746c" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#1c1e1b', border: '1px solid #2d302a' }} />
                    <Line type="monotone" dataKey="v" stroke="#d69e4b" strokeWidth={2} dot={{ fill: '#d69e4b' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="card-surface rounded-xl p-6">
              <h3 className="font-serif text-2xl text-[#f2f0e6] mb-4">Top products</h3>
              {stats.top.length === 0 ? (
                <div className="text-[#75746c] text-sm">No sales data.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.top} layout="vertical">
                    <CartesianGrid stroke="#2d302a" strokeDasharray="3 3" />
                    <XAxis type="number" stroke="#75746c" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="#a8a69c" fontSize={11} width={120} />
                    <Tooltip contentStyle={{ background: '#1c1e1b', border: '1px solid #2d302a' }} />
                    <Bar dataKey="v" fill="#4a6741" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="card-surface rounded-xl overflow-hidden">
            <div className="p-5 border-b border-[#2d302a] flex items-center justify-between">
              <h3 className="font-serif text-2xl text-[#f2f0e6]">Products</h3>
              <span className="text-xs text-[#75746c]">{products.length} items</span>
            </div>
            <div className="divide-y divide-[#2d302a]">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4" data-testid={`admin-product-row-${p.id}`}>
                  <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[#f2f0e6] font-serif text-lg truncate">{p.name}</div>
                    <div className="text-xs text-[#75746c]">
                      {formatR(p.price)} · stock {p.stock} · {p.is_organic ? 'organic' : 'regular'}
                    </div>
                  </div>
                  <button
                    data-testid={`admin-edit-${p.id}`}
                    onClick={() => setEditing(p)}
                    className="p-2 rounded-full text-[#a8a69c] hover:text-[#f2f0e6] hover:bg-[#262924]"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    data-testid={`admin-del-${p.id}`}
                    onClick={() => delProduct(p.id)}
                    className="p-2 rounded-full text-[#a8a69c] hover:text-[#c36a4e] hover:bg-[#262924]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface rounded-xl mt-8 overflow-hidden">
            <div className="p-5 border-b border-[#2d302a]">
              <h3 className="font-serif text-2xl text-[#f2f0e6]">Recent orders</h3>
            </div>
            <div className="divide-y divide-[#2d302a]">
              {orders.slice(0, 10).map((o) => (
                <div key={o.id} className="p-4 flex items-center gap-3 text-sm">
                  <div className="font-mono text-[#d69e4b]">#{o.id.slice(0, 8)}</div>
                  <div className="text-[#a8a69c]">{o.delivery_type}</div>
                  <div className="text-[#a8a69c] flex-1">{new Date(o.created_at).toLocaleString('en-ZA')}</div>
                  <div className="text-[#f2f0e6]">{formatR(o.total)}</div>
                </div>
              ))}
              {orders.length === 0 && <div className="p-6 text-[#75746c]">No orders yet.</div>}
            </div>
          </div>
        </>
      )}

      {editing && <ProductEditor initial={editing} onClose={() => setEditing(null)} onSave={saveProduct} />}
    </main>
  );
};

const ProductEditor = ({ initial, onClose, onSave }) => {
  const [f, setF] = useState({
    id: initial.id,
    name: initial.name || '',
    description: initial.description || '',
    price: initial.price || '',
    compare_at_price: initial.compare_at_price || '',
    stock: initial.stock ?? 50,
    unit: initial.unit || 'each',
    image_url: initial.image_url || '',
    is_organic: initial.is_organic || false,
    is_best_seller: initial.is_best_seller || false,
    is_new_arrival: initial.is_new_arrival || false,
    is_limited_deal: initial.is_limited_deal || false,
  });
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-surface rounded-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-[#a8a69c]"><X className="w-4 h-4" /></button>
        <h3 className="font-serif text-2xl text-[#f2f0e6] mb-4">{f.id ? 'Edit product' : 'New product'}</h3>
        {['name', 'description', 'image_url', 'unit'].map((k) => (
          <input
            key={k}
            data-testid={`pedit-${k}`}
            placeholder={k.replaceAll('_', ' ')}
            value={f[k]}
            onChange={(e) => setF({ ...f, [k]: e.target.value })}
            className="w-full px-3 py-2.5 mb-3 bg-[#131412] border border-[#2d302a] rounded-lg text-[#f2f0e6] placeholder:text-[#75746c] focus:outline-none focus:border-[#4a6741]"
          />
        ))}
        <div className="grid grid-cols-3 gap-3">
          {['price', 'compare_at_price', 'stock'].map((k) => (
            <input
              key={k}
              data-testid={`pedit-${k}`}
              placeholder={k.replaceAll('_', ' ')}
              value={f[k]}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
              className="w-full px-3 py-2.5 bg-[#131412] border border-[#2d302a] rounded-lg text-[#f2f0e6] placeholder:text-[#75746c] focus:outline-none focus:border-[#4a6741]"
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#a8a69c]">
          {[
            ['is_organic', 'Organic'],
            ['is_best_seller', 'Best seller'],
            ['is_new_arrival', 'New'],
            ['is_limited_deal', 'Limited deal'],
          ].map(([k, label]) => (
            <label key={k} className="flex items-center gap-2">
              <input
                data-testid={`pedit-${k}`}
                type="checkbox"
                checked={f[k]}
                onChange={(e) => setF({ ...f, [k]: e.target.checked })}
                className="accent-[#4a6741]"
              />
              {label}
            </label>
          ))}
        </div>
        <button
          data-testid="pedit-save-btn"
          onClick={() => onSave(f)}
          className="w-full btn-primary py-3 rounded-full text-sm mt-5"
        >
          Save product
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
