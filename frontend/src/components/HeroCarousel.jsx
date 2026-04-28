import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const banners = [
  {
    tag: "Today's Deals",
    title: 'Up to 30% off',
    subtitle: 'Heirloom tomatoes, rainbow carrots, artisan sourdough — the week’s best picks, harvested and shipped within 24h.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    accent: '#d69e4b',
    cta: 'Shop deals',
    anchor: '#deals',
  },
  {
    tag: 'Organic picks',
    title: 'Farm-direct, no middlemen',
    subtitle: 'Every organic item on this page comes from a farm we have personally walked. Rooted in the Western Cape, grown with intention.',
    image: 'https://images.pexels.com/photos/9207676/pexels-photo-9207676.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600',
    accent: '#4a6741',
    cta: 'Explore organic',
    anchor: '#organic',
  },
  {
    tag: 'Free delivery over R500',
    title: 'Your kitchen, restocked by dawn.',
    subtitle: 'Order before 6 PM and we deliver — free — across metro areas. Cash on delivery or pay at pickup.',
    image: 'https://images.pexels.com/photos/3889960/pexels-photo-3889960.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600',
    accent: '#c36a4e',
    cta: 'Start shopping',
    anchor: '#products',
  },
];

const HeroCarousel = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      data-testid="hero-carousel"
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#2d302a] h-[72vh] min-h-[520px]">
        {banners.map((b, idx) => (
          <div
            key={b.tag}
            className="absolute inset-0 transition-all duration-1000 ease-out"
            style={{
              opacity: idx === i ? 1 : 0,
              transform: idx === i ? 'scale(1)' : 'scale(1.04)',
            }}
          >
            <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-2xl px-8 sm:px-14 fade-up">
                <div
                  className="inline-flex items-center gap-2 uppercase tracking-[0.25em] text-xs mb-6 px-3 py-1 rounded-full"
                  style={{ color: b.accent, borderColor: b.accent, borderWidth: 1 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.accent }} />
                  {b.tag}
                </div>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-[#f2f0e6] leading-[1.05]">
                  {b.title}
                </h1>
                <p className="mt-6 text-[#a8a69c] text-lg max-w-xl leading-relaxed">
                  {b.subtitle}
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <a
                    href={b.anchor}
                    data-testid={`hero-cta-${idx}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full btn-primary text-sm tracking-wide"
                  >
                    {b.cta} <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#products"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#2d302a] text-sm hover:border-[#f2f0e6] transition text-[#f2f0e6]"
                  >
                    Shop now
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-6 left-8 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              data-testid={`hero-dot-${idx}`}
              onClick={() => setI(idx)}
              className="h-1 rounded-full transition-all"
              style={{
                width: idx === i ? 40 : 16,
                background: idx === i ? '#f2f0e6' : '#75746c',
              }}
              aria-label={`Banner ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
