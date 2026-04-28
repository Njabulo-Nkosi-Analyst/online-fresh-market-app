import React from 'react';

const FilterPanel = ({ filter, setFilter }) => {
  return (
    <div
      data-testid="filter-panel"
      className="card-surface rounded-xl p-4 mt-4"
    >
      <div className="text-xs uppercase tracking-[0.25em] text-[#75746c] mb-3">
        Filter
      </div>

      <div className="text-xs text-[#a8a69c] mb-2">
        Price up to{' '}
        <span className="text-[#f2f0e6]">R {filter.maxPrice}</span>
      </div>
      <input
        data-testid="filter-price-slider"
        type="range"
        min="20"
        max="200"
        step="10"
        value={filter.maxPrice}
        onChange={(e) => setFilter({ ...filter, maxPrice: Number(e.target.value) })}
        className="w-full accent-[#4a6741]"
      />

      <div className="mt-4 flex items-center justify-between">
        <label className="text-sm text-[#a8a69c] flex items-center gap-2">
          <input
            data-testid="filter-organic-only"
            type="checkbox"
            checked={filter.organicOnly}
            onChange={(e) => setFilter({ ...filter, organicOnly: e.target.checked })}
            className="accent-[#4a6741]"
          />
          Organic only
        </label>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <label className="text-sm text-[#a8a69c] flex items-center gap-2">
          <input
            data-testid="filter-in-stock"
            type="checkbox"
            checked={filter.inStock}
            onChange={(e) => setFilter({ ...filter, inStock: e.target.checked })}
            className="accent-[#4a6741]"
          />
          In stock only
        </label>
      </div>
    </div>
  );
};

export default FilterPanel;
