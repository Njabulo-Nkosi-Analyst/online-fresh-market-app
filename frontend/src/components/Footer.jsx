import React from 'react';
import { Leaf } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-[#2d302a] mt-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
      <div>
        <div className="flex items-center gap-2 font-serif text-2xl text-[#f2f0e6]">
          <Leaf className="w-5 h-5 text-[#d69e4b]" />
          Roots<span className="text-[#c36a4e]">&</span>Earth
        </div>
        <p className="text-sm text-[#a8a69c] mt-3 leading-relaxed max-w-sm">
          Farm-direct fresh produce, delivered to your door across South Africa. Grown with intention.
        </p>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-[#75746c] mb-3">Shop</div>
        <ul className="space-y-2 text-sm text-[#a8a69c]">
          <li><a href="#products" className="hover:text-[#f2f0e6]">All produce</a></li>
          <li><a href="#organic" className="hover:text-[#f2f0e6]">Organic picks</a></li>
          <li><a href="#deals" className="hover:text-[#f2f0e6]">This week&apos;s deals</a></li>
        </ul>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-[#75746c] mb-3">Help</div>
        <ul className="space-y-2 text-sm text-[#a8a69c]">
          <li>Delivery info</li>
          <li>Pickup locations</li>
          <li>Returns</li>
          <li>Contact</li>
        </ul>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-[#75746c] mb-3">Newsletter</div>
        <p className="text-sm text-[#a8a69c] mb-3">
          Seasonal picks and producer stories, monthly.
        </p>
        <div className="flex gap-2">
          <input
            placeholder="Your email"
            className="flex-1 px-3 py-2 bg-[#1c1e1b] border border-[#2d302a] rounded-full text-sm text-[#f2f0e6] placeholder:text-[#75746c] focus:outline-none focus:border-[#4a6741]"
          />
          <button className="btn-primary px-4 py-2 rounded-full text-sm">Subscribe</button>
        </div>
      </div>
    </div>
    <div className="border-t border-[#2d302a] py-5 text-center text-xs text-[#75746c]">
      © {new Date().getFullYear()} Roots & Earth · Cape Town, South Africa
    </div>
  </footer>
);

export default Footer;
