import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import ProductCard from '@/components/ProductCard';
import { Heart, ArrowLeft } from 'lucide-react';

const FavoritesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { setAuthOpen } = useUI();
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [favIds, setFavIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('favorites')
      .select('product_id, products(*)')
      .eq('user_id', user.id);
    const prods = (data || []).map((x) => x.products).filter(Boolean);
    setItems(prods);
    setFavIds(new Set(prods.map((p) => p.id)));
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setAuthOpen(true); nav('/'); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const toggle = async (p) => {
    await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', p.id);
    setItems((list) => list.filter((x) => x.id !== p.id));
    setFavIds((s) => { const n = new Set(s); n.delete(p.id); return n; });
  };

  if (!user) return null;

  return (
    <main data-testid="favorites-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        data-testid="favorites-back-btn"
        onClick={() => nav('/')}
        className="inline-flex items-center gap-2 text-sm text-[#a8a69c] hover:text-[#f2f0e6] mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to shop
      </button>
      <div className="mb-10">
        <div className="text-[#d69e4b] text-xs uppercase tracking-[0.25em]">Saved</div>
        <h1 className="font-serif text-5xl text-[#f2f0e6] mt-2">Favourites</h1>
      </div>
      {loading ? (
        <div className="text-[#a8a69c]">Loading…</div>
      ) : items.length === 0 ? (
        <div className="card-surface rounded-xl p-12 text-center">
          <Heart className="w-10 h-10 mx-auto text-[#2d302a] mb-3" />
          <p className="text-[#a8a69c]">Nothing saved yet — hit the heart on any product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} isFav={favIds.has(p.id)} onToggleFavorite={toggle} />
          ))}
        </div>
      )}
    </main>
  );
};

export default FavoritesPage;
