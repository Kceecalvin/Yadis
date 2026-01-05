'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SearchFilters {
  name: string;
  categories: string[];
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean | null;
  minRating: number | null;
  sortBy: string;
}

interface SavedFilter {
  id: string;
  name: string;
  categories: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  minRating?: number;
  sortBy?: string;
}

interface Props {
  onSearch: (filters: Omit<SearchFilters, 'name'>) => void;
  categories?: Array<{ id: string; titleEn: string }>;
}

export default function AdvancedSearch({ onSearch, categories = [] }: Props) {
  const { data: session } = useSession();
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    categories: [],
    priceMin: null,
    priceMax: null,
    inStock: null,
    minRating: null,
    sortBy: 'newest',
  });

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSavedFilters();
    }
  }, [session]);

  const fetchSavedFilters = async () => {
    try {
      const response = await fetch('/api/search/filters');
      if (response.ok) {
        const data = await response.json();
        setSavedFilters(data.filters || []);
      }
    } catch (err) {
      console.error('Error fetching saved filters:', err);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleSearch = () => {
    const { name, ...searchFilters } = filters;
    onSearch(searchFilters);
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      setError('Please enter a filter name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: filterName,
          ...filters,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to save filter');
        return;
      }

      setSuccess('Filter saved successfully!');
      setFilterName('');
      setShowSaveForm(false);
      setTimeout(() => {
        fetchSavedFilters();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError('Error saving filter');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedFilter = (saved: SavedFilter) => {
    setFilters({
      name: saved.name,
      categories: saved.categories || [],
      priceMin: saved.priceMin || null,
      priceMax: saved.priceMax || null,
      inStock: saved.inStock || null,
      minRating: saved.minRating || null,
      sortBy: saved.sortBy || 'newest',
    });
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      categories: [],
      priceMin: null,
      priceMax: null,
      inStock: null,
      minRating: null,
      sortBy: 'newest',
    });
  };

  return (
    <div className="bg-white border border-brand-accent/20 rounded-lg p-6">
      <h2 className="text-xl font-bold text-brand-dark mb-6">Advanced Search</h2>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-brand-dark mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="rounded border-brand-accent/30"
                  />
                  <span className="text-sm text-brand-secondary">{cat.titleEn}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-brand-dark mb-3">Price Range (KES)</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin || ''}
                onChange={(e) =>
                  handleFilterChange('priceMin', e.target.value ? parseInt(e.target.value) : null)
                }
                className="flex-1 px-3 py-2 border border-brand-accent/20 rounded text-sm focus:outline-none focus:border-brand-primary"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax || ''}
                onChange={(e) =>
                  handleFilterChange('priceMax', e.target.value ? parseInt(e.target.value) : null)
                }
                className="flex-1 px-3 py-2 border border-brand-accent/20 rounded text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Stock Status */}
          <div>
            <h3 className="font-semibold text-brand-dark mb-3">Availability</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  checked={filters.inStock === null}
                  onChange={() => handleFilterChange('inStock', null)}
                />
                <span className="text-sm text-brand-secondary">All</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  checked={filters.inStock === true}
                  onChange={() => handleFilterChange('inStock', true)}
                />
                <span className="text-sm text-brand-secondary">In Stock Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  checked={filters.inStock === false}
                  onChange={() => handleFilterChange('inStock', false)}
                />
                <span className="text-sm text-brand-secondary">Out of Stock</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Minimum Rating */}
          <div>
            <h3 className="font-semibold text-brand-dark mb-3">Minimum Rating</h3>
            <div className="space-y-2">
              {[null, 4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating}
                    onChange={() => handleFilterChange('minRating', rating)}
                  />
                  <span className="text-sm text-brand-secondary">
                    {rating === null ? 'Any' : `${rating}+ Stars`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="font-semibold text-brand-dark mb-3">Sort By</h3>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-brand-accent/20 rounded text-sm focus:outline-none focus:border-brand-primary"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Most Reviewed</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div>
              <h3 className="font-semibold text-brand-dark mb-3">Saved Filters</h3>
              <div className="space-y-2">
                {savedFilters.map((saved) => (
                  <button
                    key={saved.id}
                    onClick={() => loadSavedFilter(saved)}
                    className="w-full text-left px-3 py-2 border border-brand-accent/20 rounded text-sm hover:bg-brand-light transition-colors"
                  >
                    {saved.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={handleSearch}
          className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
        >
          Search
        </button>
        <button
          onClick={resetFilters}
          className="flex-1 px-4 py-2 border border-brand-primary text-brand-primary rounded-lg font-semibold hover:bg-brand-light transition-colors"
        >
          Reset
        </button>
        {session?.user?.id && (
          <button
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="flex-1 px-4 py-2 border border-brand-accent text-brand-secondary rounded-lg font-semibold hover:bg-brand-light transition-colors"
          >
            Save Filter
          </button>
        )}
      </div>

      {/* Save Filter Form */}
      {showSaveForm && (
        <div className="mt-4 p-4 bg-brand-light border border-brand-accent/20 rounded">
          <label className="block text-sm font-semibold text-brand-dark mb-2">
            Filter Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Budget Snacks"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="flex-1 px-3 py-2 border border-brand-accent/20 rounded text-sm focus:outline-none focus:border-brand-primary"
            />
            <button
              onClick={handleSaveFilter}
              disabled={loading}
              className="px-4 py-2 bg-brand-primary text-white rounded font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
