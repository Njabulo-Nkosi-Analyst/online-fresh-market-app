import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBasket, Heart, User, Search, LogOut, Leaf, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';

const Navbar = () => {
  const { count, setOpen } = useCart();
  const { user, profile, signOut } = useAuth();
  const { setAuthOpen } = useUI();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#131412]/80 border-b border-[#2d302a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">        <Link
          to="/"
          data-testid="brand-home-link"
          className="flex items-center gap-2 font-serif text-2xl text-[#f2f0e6]"
        >
          <Leaf className="w-5 h-5 text-[#d69e4b]" />
          <span className="tracking-tight">Roots<span className="text-[#c36a4e]">&</span>Earth</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 ml-6 text-sm text-[#a8a69c]">
          <Link to="/" data-testid="nav-shop" className="link-underline hover:text-[#f2f0e6]">Shop</Link>
          <a href="#organic" data-testid="nav-organic" className="link-underline hover:text-[#f2f0e6]">Organic</a>
          <a href="#deals" data-testid="nav-deals" className="link-underline hover:text-[#f2f0e6]">Deals</a>
          <a href="#about" data-testid="nav-about" className="link-underline hover:text-[#f2f0e6]">About</a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-[#1c1e1b] border border-[#2d302a] px-3 py-2 rounded-full w-64">
            <Search className="w-4 h-4 text-[#75746c]" />
            <input
              data-testid="global-search-input"
              placeholder="Search fresh goods…"
              className="bg-transparent outline-none text-sm text-[#f2f0e6] placeholder:text-[#75746c] w-full"
              onChange={(e) => {
                window.dispatchEvent(new CustomEvent('re:search', { detail: e.target.value }));
              }}
            />
          </div>

          {user && (
            <button
              data-testid="nav-favorites-btn"
              onClick={() => nav('/favorites')}
              title="Favorites"
              className="p-2 rounded-full hover:bg-[#1c1e1b] text-[#a8a69c] hover:text-[#c36a4e] transition"
            >
              <Heart className="w-5 h-5" />
            </button>
          )}

          <button
            data-testid="nav-cart-btn"
            onClick={() => setOpen(true)}
            className="relative p-2 rounded-full hover:bg-[#1c1e1b] text-[#a8a69c] hover:text-[#f2f0e6] transition"
          >
            <ShoppingBasket className="w-5 h-5" />
            {count > 0 && (
              <span
                data-testid="cart-count-badge"
                className="absolute -top-1 -right-1 bg-[#c36a4e] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium"
              >
                {count}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#2d302a]">
              <button
                data-testid="nav-user-pill"
                onClick={() => nav('/orders')}
                title="My orders"
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-[#1c1e1b] hover:bg-[#262924] border border-[#2d302a] hover:border-[#4a6741] transition group"
              >
                <span
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4a6741] to-[#d69e4b] flex items-center justify-center text-[#131412] font-serif text-sm font-semibold flex-shrink-0"
                >
                  {(profile?.full_name || user.email || '?').trim().charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-[10px] text-[#75746c] uppercase tracking-wider">Hello</span>
                  <span
                    data-testid="nav-user-name"
                    className="text-sm text-[#f2f0e6] mt-0.5 max-w-[140px] truncate"
                  >
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                </span>
              </button>
              {profile?.is_admin && (
                <button
                  data-testid="nav-admin-btn"
                  onClick={() => nav('/admin')}
                  title="Admin"
                  className="p-2 rounded-full hover:bg-[#1c1e1b] text-[#d69e4b] transition"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </button>
              )}
              <button
                data-testid="nav-signout-btn"
                onClick={signOut}
                title="Sign out"
                className="p-2 rounded-full hover:bg-[#1c1e1b] text-[#a8a69c] hover:text-[#c36a4e] transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              data-testid="nav-signin-btn"
              onClick={() => setAuthOpen(true)}
              className="px-4 py-2 text-sm rounded-full btn-primary"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Mobile search — visible only on small screens */}
      <div className="sm:hidden px-4 pb-3">
        <div className="flex items-center gap-2 bg-[#1c1e1b] border border-[#2d302a] px-3 py-2 rounded-full">
          <Search className="w-4 h-4 text-[#75746c]" />
          <input
            data-testid="global-search-input-mobile"
            placeholder="Search fresh goods…"
            className="bg-transparent outline-none text-sm text-[#f2f0e6] placeholder:text-[#75746c] w-full"
            onChange={(e) => {
              window.dispatchEvent(new CustomEvent('re:search', { detail: e.target.value }));
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
