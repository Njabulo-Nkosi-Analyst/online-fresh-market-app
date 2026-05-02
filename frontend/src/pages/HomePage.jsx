import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import HeroCarousel from '@/components/HeroCarousel';
import CategorySidebar from '@/components/CategorySidebar';
import FilterPanel from '@/components/FilterPanel';
import ProductCard from '@/components/ProductCard';
import CountdownTimer from '@/components/CountdownTimer';
import { Flame, Sparkles, Timer, Package } from 'lucide-react';

const Section = ({ id, icon: Icon, title, kicker, children, right }) => (
  <section id={id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="flex items-end justify-between mb-8">
      <div>
        <div className="flex items-center gap-2 text-[#d69e4b] text-xs uppercase tracking-[0.25em]">
          <Icon className="w-4 h-4" />
          {kicker}
        </div>
        <h2 className="font-serif text-4xl sm:text-5xl text-[#f2f0e6] mt-2">{title}</h2>
      </div>
      {right}
    </div>
    {children}
  </section>
);

const HomePage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ maxPrice: 200, organicOnly: false, inStock: true });
  const [favIds, setFavIds] = useState(new Set());

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!user) { setFavIds(new Set()); return; }
    (async () => {
      const { data } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);
      setFavIds(new Set((data || []).map((x) => x.product_id)));
    })();
  }, [user]);

  useEffect(() => {
    const h = (e) => setSearch(e.detail || '');
    window.addEventListener('re:search', h);
    return () => window.removeEventListener('re:search', h);
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selected && p.category_id !== selected) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter.organicOnly && !p.is_organic) return false;
      if (filter.inStock && p.stock <= 0) return false;
      if (Number(p.price) > filter.maxPrice) return false;
      return true;
    });
  }, [products, selected, search, filter]);

  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 4);
  const organicPicks = products.filter((p) => p.is_organic).slice(0, 4);
  const newArrivals = products.filter((p) => p.is_new_arrival).slice(0, 4);
  const limitedDeals = products.filter((p) => p.is_limited_deal).slice(0, 4);

  const toggleFav = async (p) => {
    if (!user) {
      toast.error('Sign in to save favourites');
      return;
    }
    if (favIds.has(p.id)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', p.id);
      setFavIds((s) => { const n = new Set(s); n.delete(p.id); return n; });
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, product_id: p.id });
      setFavIds((s) => new Set(s).add(p.id));
      toast.success('Saved to favourites');
    }
  };

  const renderGrid = (list) =>
    loading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-surface rounded-xl aspect-[4/5] shimmer" />
        ))}
      </div>
    ) : list.length === 0 ? (
      <div className="card-surface rounded-xl p-12 text-center text-[#a8a69c]">
        No products match your filters.
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {list.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            isFav={favIds.has(p.id)}
            onToggleFavorite={toggleFav}
          />
        ))}
      </div>
    );

  return (
    <main data-testid="home-page">
      <HeroCarousel />

      {/* Limited time deals */}
      <Section
        id="deals"
        icon={Timer}
        kicker="Limited time"
        title="Today's harvest, today's price."
        right={<CountdownTimer hours={8} />}
      >
        {renderGrid(limitedDeals)}
      </Section>

      {/* Categories + main product grid */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <div>
            <CategorySidebar
              categories={categories}
              selected={selected}
              onSelect={setSelected}
            />
            <FilterPanel filter={filter} setFilter={setFilter} />
          </div>
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-[#d69e4b] text-xs uppercase tracking-[0.25em]">Marketplace</div>
                <h2 className="font-serif text-4xl sm:text-5xl text-[#f2f0e6] mt-2">
                  {selected
                    ? categories.find((c) => c.id === selected)?.name || 'Shop'
                    : 'All produce'}
                </h2>
                <p className="text-sm text-[#a8a69c] mt-1">
                  {filtered.length} items · sorted by freshness
                </p>
              </div>
            </div>
            {renderGrid(filtered)}
          </div>
        </div>
      </section>

      <Section id="bestsellers" icon={Flame} kicker="Best sellers" title="What the neighbourhood loves.">
        {renderGrid(bestSellers)}
      </Section>

      <Section id="organic" icon={Sparkles} kicker="Organic picks" title="Certified organic, sourced with care.">
        {renderGrid(organicPicks)}
      </Section>

      <Section id="new" icon={Package} kicker="Just in" title="Fresh from this week's delivery.">
        {renderGrid(newArrivals)}
      </Section>

      {/* About / Our story */}
      <section
        id="about"
        data-testid="about-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80"
              alt="Hands holding fresh harvested vegetables"
              className="rounded-2xl border border-[#2d302a] w-full h-[420px] object-cover"
            />
            <div className="absolute -bottom-5 -right-5 hidden md:block card-surface rounded-xl p-4 max-w-[220px]">
              <div className="text-[#d69e4b] text-[10px] uppercase tracking-[0.25em]">Our promise</div>
              <p className="text-[#f2f0e6] text-sm mt-1 leading-snug">
                Picked this morning. In your kitchen by sunset.
              </p>
            </div>
          </div>
          <div>
            <div className="text-[#d69e4b] text-xs uppercase tracking-[0.25em]">Our story</div>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#f2f0e6] mt-2">
              Real food, from real people, picked just for you.
            </h2>
            <p className="text-[#a8a69c] mt-5 leading-relaxed">
              <span className="text-[#f2f0e6]">Roots &amp; Earth</span> started in
              Cape Town with a small idea: the produce in our supermarkets was
              travelling further than the people eating it. We thought food
              should taste better &mdash; and do more good &mdash; when it&apos;s
              grown nearby and gets to your kitchen the same week.
            </p>
            <p className="text-[#a8a69c] mt-3 leading-relaxed">
              Today we partner with small organic growers across the Western
              Cape, free-range egg farmers in Stellenbosch, jersey-cow dairies
              in Elgin, and bakers in Woodstock who still ferment for 24 hours.
              We personally walk every farm we work with. Every order is
              hand-packed in the morning, delivered carbon-neutral, and paid
              for fairly &mdash; no middlemen, no waste, no nonsense.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="card-surface rounded-xl p-4 text-center">
                <div className="font-serif text-3xl text-[#d69e4b]">12+</div>
                <div className="text-xs text-[#a8a69c] mt-1">Local farms</div>
              </div>
              <div className="card-surface rounded-xl p-4 text-center">
                <div className="font-serif text-3xl text-[#4a6741]">24h</div>
                <div className="text-xs text-[#a8a69c] mt-1">Farm to door</div>
              </div>
              <div className="card-surface rounded-xl p-4 text-center">
                <div className="font-serif text-3xl text-[#c36a4e]">100%</div>
                <div className="text-xs text-[#a8a69c] mt-1">Hand-packed</div>
              </div>
            </div>
            <p className="text-[#d69e4b] italic font-serif text-lg mt-8">
              &ldquo;We grow what we&apos;d feed our own family. Nothing less.&rdquo;
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
