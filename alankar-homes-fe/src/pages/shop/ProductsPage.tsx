import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SearchX } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { fetchCategories, fetchProducts } from '../../features/shop/shopService';
import { ProductCard } from '../../features/shop/components/ProductCard';
import { EmptyState, ErrorMessage, Spinner } from '../../components/common/Feedback';

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
];

export const ProductsPage: React.FC = () => {
  // Filters live in the URL so links like /products?category=2 can be shared
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(search);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  // Wait until typing pauses before searching
  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => updateParam('search', searchInput.trim()), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const categories = useAsync(fetchCategories, []);
  const products = useAsync(
    () => fetchProducts({ search: search || undefined, category: category || undefined, sort, page, limit: 12 }),
    [search, category, sort, page]
  );

  const activeCategory = categories.data?.find((c) => String(c.id) === category);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <div className="mb-8 space-y-2">
        <h1 className="font-serif text-3xl text-[#ecc588]">{activeCategory ? activeCategory.name : 'All handmade gifts'}</h1>
        {activeCategory?.description && <p className="text-sm text-[#8ba5a0]/85 max-w-2xl">{activeCategory.description}</p>}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search gifts..."
            className="input-field pl-11 pr-4 py-3 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 w-full"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value === 'newest' ? '' : e.target.value)}
          className="input-field px-4 py-3 rounded-lg text-sm text-stone-100 md:w-56"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#011714]">{s.label}</option>
          ))}
        </select>
      </div>

      {categories.data && categories.data.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {[{ id: '', name: 'All' }, ...categories.data].map((c) => {
            const active = String(c.id) === category;
            return (
              <button
                key={c.id}
                onClick={() => updateParam('category', String(c.id))}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-gold-gradient text-stone-950 border-transparent'
                    : 'border-[#0e3f38] text-[#8ba5a0] hover:text-[#ecc588] hover:border-[#caa060]/50'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      {products.isLoading && <Spinner />}
      {products.error && <ErrorMessage message={products.error} onRetry={products.reload} />}

      {!products.isLoading && products.data && products.data.products.length === 0 && (
        <EmptyState icon={<SearchX className="w-10 h-10" strokeWidth={1.25} />} title="No gifts found">
          <p className="text-sm text-[#8ba5a0]">Try a different search or category.</p>
        </EmptyState>
      )}

      {!products.isLoading && products.data && products.data.products.length > 0 && (
        <>
          <p className="text-xs text-[#8ba5a0] mb-4">
            {products.data.pagination.total} {products.data.pagination.total === 1 ? 'item' : 'items'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.data.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => updateParam('page', String(page - 1))}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#0e3f38] text-stone-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-[#8ba5a0]">
                Page {page} of {products.data.pagination.totalPages}
              </span>
              <button
                disabled={page >= products.data.pagination.totalPages}
                onClick={() => updateParam('page', String(page + 1))}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#0e3f38] text-stone-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
