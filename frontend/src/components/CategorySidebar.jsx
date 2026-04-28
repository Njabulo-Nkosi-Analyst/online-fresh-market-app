import React from 'react';
import { Apple, Carrot, Egg, Milk, Cookie, CupSoda } from 'lucide-react';

const ICONS = {
  apple: Apple,
  'leafy-green': Carrot,
  egg: Egg,
  milk: Milk,
  cookie: Cookie,
  'cup-soda': CupSoda,
};

const CategorySidebar = ({ categories, selected, onSelect }) => {
  return (
    <aside
      data-testid="category-sidebar"
      className="card-surface rounded-xl p-4 sticky top-24"
    >
      <div className="text-xs uppercase tracking-[0.25em] text-[#75746c] mb-3 px-2">
        Popular Categories
      </div>
      <div className="flex flex-col gap-1">
        <button
          data-testid="category-all"
          onClick={() => onSelect(null)}
          className={`flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm transition ${
            !selected
              ? 'bg-[#262924] text-[#f2f0e6]'
              : 'text-[#a8a69c] hover:bg-[#262924] hover:text-[#f2f0e6]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#c36a4e]" />
          All produce
        </button>
        {categories.map((c) => {
          const Icon = ICONS[c.icon] || Apple;
          const active = selected === c.id;
          return (
            <button
              key={c.id}
              data-testid={`category-${c.slug}`}
              onClick={() => onSelect(c.id)}
              className={`group flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? 'bg-[#262924] text-[#f2f0e6]'
                  : 'text-[#a8a69c] hover:bg-[#262924] hover:text-[#f2f0e6]'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  active ? 'text-[#d69e4b]' : 'text-[#75746c] group-hover:text-[#d69e4b]'
                }`}
              />
              <span className="flex-1">{c.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default CategorySidebar;
