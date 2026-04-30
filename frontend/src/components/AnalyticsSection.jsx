import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, Eye, Activity, MousePointerClick, RefreshCw } from 'lucide-react';

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

const EVENT_LABELS = {
  page_view: 'viewed a page',
  add_to_cart: 'added to cart',
  order_placed: 'placed an order',
  sign_in: 'signed in',
  sign_up: 'signed up',
};

const AnalyticsSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2000);
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const DAY = 24 * 3600 * 1000;
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    const today0Ts = today0.getTime();

    const uniqueVisitors = new Set();
    const uniqueToday = new Set();
    const sessions = new Set();
    let viewsToday = 0;
    let viewsWeek = 0;
    let activeNow = new Set();

    const viewsByDay = {};
    const pathCount = {};
    const productCount = {};

    for (const e of events) {
      const ts = new Date(e.created_at).getTime();
      if (e.visitor_id) uniqueVisitors.add(e.visitor_id);
      if (e.session_id) sessions.add(e.session_id);

      if (e.event_type === 'page_view') {
        if (ts >= today0Ts) {
          viewsToday += 1;
          if (e.visitor_id) uniqueToday.add(e.visitor_id);
        }
        if (now - ts <= 7 * DAY) viewsWeek += 1;
        const d = new Date(e.created_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
        viewsByDay[d] = (viewsByDay[d] || 0) + 1;
        const p = e.page_path || '/';
        pathCount[p] = (pathCount[p] || 0) + 1;
      }

      if (e.event_type === 'add_to_cart' && e.event_data?.product_name) {
        productCount[e.event_data.product_name] = (productCount[e.event_data.product_name] || 0) + 1;
      }

      if (now - ts < 5 * 60 * 1000 && e.visitor_id) {
        activeNow.add(e.visitor_id);
      }
    }

    const series = Object.entries(viewsByDay).reverse().slice(-14).map(([name, v]) => ({ name, v }));
    const topPages = Object.entries(pathCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([path, v]) => ({ path, v }));
    const topProducts = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, v]) => ({ name, v }));

    return {
      uniqueVisitors: uniqueVisitors.size,
      uniqueToday: uniqueToday.size,
      sessions: sessions.size,
      viewsToday,
      viewsWeek,
      activeNow: activeNow.size,
      series,
      topPages,
      topProducts,
    };
  }, [events]);

  return (
    <section data-testid="analytics-section" className="mt-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-[#d69e4b] text-xs uppercase tracking-[0.25em]">Live</div>
          <h2 className="font-serif text-4xl text-[#f2f0e6] mt-1">Visitor analytics</h2>
        </div>
        <button
          data-testid="analytics-refresh-btn"
          onClick={load}
          className="inline-flex items-center gap-2 text-xs text-[#a8a69c] hover:text-[#f2f0e6] px-3 py-2 rounded-full border border-[#2d302a]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}             label="Unique visitors"      value={stats.uniqueVisitors} hint="all time" accent="#d69e4b" />
        <StatCard icon={Activity}          label="Active now"           value={stats.activeNow}      hint="last 5 min" accent="#4a6741" />
        <StatCard icon={Eye}               label="Page views today"     value={stats.viewsToday}     hint={`${stats.uniqueToday} unique`} accent="#c36a4e" />
        <StatCard icon={MousePointerClick} label="Sessions"             value={stats.sessions}       hint="all time" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] mt-6">
        <div className="card-surface rounded-xl p-6">
          <h3 className="font-serif text-2xl text-[#f2f0e6] mb-4">Page views (last 14 days)</h3>
          {stats.series.length === 0 ? (
            <div className="text-[#75746c] text-sm">No visitor data yet. Open your live site in another browser to seed some events!</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.series}>
                <defs>
                  <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#d69e4b" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#d69e4b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2d302a" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#75746c" fontSize={11} />
                <YAxis stroke="#75746c" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1c1e1b', border: '1px solid #2d302a' }} />
                <Area type="monotone" dataKey="v" stroke="#d69e4b" strokeWidth={2} fill="url(#v)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-surface rounded-xl p-6">
          <h3 className="font-serif text-2xl text-[#f2f0e6] mb-4">Top pages</h3>
          {stats.topPages.length === 0 ? (
            <div className="text-[#75746c] text-sm">—</div>
          ) : (
            <ul className="space-y-2">
              {stats.topPages.map((p) => (
                <li key={p.path} className="flex items-center justify-between text-sm border-b border-[#2d302a] py-2 last:border-0">
                  <span className="font-mono text-[#a8a69c] truncate pr-4">{p.path}</span>
                  <span className="text-[#f2f0e6] font-serif text-lg">{p.v}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <div className="card-surface rounded-xl p-6">
          <h3 className="font-serif text-2xl text-[#f2f0e6] mb-4">Most added-to-cart</h3>
          {stats.topProducts.length === 0 ? (
            <div className="text-[#75746c] text-sm">No add-to-cart events yet.</div>
          ) : (
            <ul className="space-y-2">
              {stats.topProducts.map((p) => (
                <li key={p.name} className="flex items-center justify-between text-sm border-b border-[#2d302a] py-2 last:border-0">
                  <span className="text-[#f2f0e6] truncate pr-4">{p.name}</span>
                  <span className="text-[#d69e4b] font-serif text-lg">{p.v}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-surface rounded-xl p-6">
          <h3 className="font-serif text-2xl text-[#f2f0e6] mb-4">Recent activity</h3>
          {events.length === 0 ? (
            <div className="text-[#75746c] text-sm">Nothing yet.</div>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {events.slice(0, 25).map((e) => (
                <li key={e.id} className="flex items-center gap-3 text-sm border-b border-[#2d302a] py-2 last:border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d69e4b] flex-shrink-0" />
                  <span className="text-[#a8a69c]">
                    <span className="font-mono text-[#75746c]">{(e.visitor_id || '').slice(0, 6)}</span>{' '}
                    {EVENT_LABELS[e.event_type] || e.event_type}
                    {e.event_data?.product_name ? (
                      <span className="text-[#f2f0e6]"> · {e.event_data.product_name}</span>
                    ) : e.event_type === 'page_view' && e.page_path ? (
                      <span className="text-[#f2f0e6]"> · {e.page_path}</span>
                    ) : null}
                  </span>
                  <span className="ml-auto text-[10px] text-[#75746c]">
                    {new Date(e.created_at).toLocaleTimeString('en-ZA')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;
