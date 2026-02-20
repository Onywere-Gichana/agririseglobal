import { useState } from 'react';

const CATEGORIES = [
  { value: 'all', label: 'All Posts' },
  { value: 'crop-production', label: 'Crop Production' },
  { value: 'livestock-production', label: 'Livestock Production' },
  { value: 'agricultural-engineering', label: 'Agricultural Engineering' },
  { value: 'agricultural-economics', label: 'Agricultural Economics' },
  { value: 'generic', label: 'Generic' },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      {/* Mobile: Toggle button */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg flex items-center justify-between shadow-sm hover:bg-slate-50"
        >
          <span className="font-medium text-slate-700">
            {CATEGORIES.find((c) => c.value === selectedCategory)?.label || 'All Posts'}
          </span>
          <svg
            className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="mt-2 bg-white border border-slate-300 rounded-lg shadow-lg overflow-hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  onCategoryChange(cat.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors ${
                  selectedCategory === cat.value ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Horizontal buttons */}
      <div className="hidden md:flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => onCategoryChange(cat.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === cat.value
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
