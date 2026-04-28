import React from 'react';
import { Heart, Star, Plus } from 'lucide-react';
import { formatR } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const ProductCard = ({ product, onToggleFavorite, isFav }) => {
  const { add } = useCart();
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : 0;
  const low = product.stock > 0 && product.stock <= 20;
  const out = product.stock <= 0;

  const onAdd = () => {
    if (out) return toast.error('Out of stock');
    add(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="group card-surface rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#4a6741]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#262924]">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {discount > 0 && (
            <span
              data-testid={`discount-badge-${product.id}`}
              className="text-[10px] uppercase tracking-wider bg-[#c36a4e] text-white px-2 py-1 rounded-full font-medium"
            >
              −{discount}%
            </span>
          )}
          {product.is_organic && (
            <span className="text-[10px] uppercase tracking-wider bg-[#4a6741] text-white px-2 py-1 rounded-full font-medium">
              Organic
            </span>
          )}
          {product.is_new_arrival && (
            <span className="text-[10px] uppercase tracking-wider bg-[#d69e4b] text-[#131412] px-2 py-1 rounded-full font-medium">
              New
            </span>
          )}
        </div>

        <button
          data-testid={`wishlist-btn-${product.id}`}
          onClick={() => onToggleFavorite && onToggleFavorite(product)}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition"
        >
          <Heart
            className="w-4 h-4"
            fill={isFav ? '#c36a4e' : 'transparent'}
            stroke={isFav ? '#c36a4e' : '#f2f0e6'}
            strokeWidth={1.8}
          />
        </button>

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px]">
          <span
            className={`uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm ${
              out
                ? 'bg-red-900/60 text-red-200'
                : low
                ? 'bg-[#d69e4b]/30 text-[#d69e4b]'
                : 'bg-[#4a6741]/30 text-[#b5cfa9]'
            }`}
          >
            {out ? 'Out of stock' : low ? `Low — ${product.stock} left` : 'In stock'}
          </span>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-[#f2f0e6]">
            <Star className="w-3 h-3 fill-[#d69e4b] stroke-[#d69e4b]" />
            <span>{product.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#75746c] mb-1">
          {product.unit}
        </div>
        <h3 className="font-serif text-lg text-[#f2f0e6] leading-tight line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-[#a8a69c] mt-1 line-clamp-2 min-h-[32px]">
          {product.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="font-serif text-xl text-[#f2f0e6]">{formatR(product.price)}</div>
            {discount > 0 && (
              <div className="text-xs text-[#75746c] line-through">
                {formatR(product.compare_at_price)}
              </div>
            )}
          </div>
          <button
            data-testid={`add-to-cart-${product.id}`}
            onClick={onAdd}
            disabled={out}
            className="inline-flex items-center gap-1.5 btn-primary px-3 py-2 rounded-full text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
