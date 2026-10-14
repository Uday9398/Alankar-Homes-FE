import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { adminFetchProducts, deleteProduct, updateProduct } from '../../features/shop/shopService';
import type { Product } from '../../features/shop/shopTypes';
import { ErrorMessage, Spinner } from '../../components/common/Feedback';
import { ProductImage } from '../../components/common/ProductImage';
import { formatCurrency } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';

export const AdminProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, setData, isLoading, error, reload } = useAsync(
    () => adminFetchProducts({ search: search.trim() || undefined, page, limit: 20 }),
    [search, page]
  );

  const replaceProduct = (updated: Product) => {
    setData((prev) => prev && { ...prev, products: prev.products.map((p) => (p.id === updated.id ? updated : p)) });
  };

  const toggle = async (product: Product, field: 'isActive' | 'isFeatured') => {
    setActionError(null);
    try {
      replaceProduct(await updateProduct(product.id, { [field]: !product[field] }));
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}" permanently?\n\nTip: use "Hide" instead if you might sell it again.`)) return;
    setActionError(null);
    try {
      await deleteProduct(product.id);
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-[#ecc588]">Products</h1>
        <Link
          to={ROUTES.ADMIN_NEW_PRODUCT}
          className="inline-flex items-center gap-2 py-2.5 px-5 bg-gold-gradient text-stone-950 font-semibold rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" /> Add product
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search products..."
          className="input-field pl-11 pr-4 py-3 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 w-full"
        />
      </div>

      {actionError && <ErrorMessage message={actionError} />}
      {isLoading && <Spinner />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!isLoading && data && data.products.length === 0 && (
        <div className="glass-card rounded-xl p-10 text-center space-y-3">
          <p className="text-sm text-[#8ba5a0]">{search ? 'No products match your search.' : 'No products yet. Add your first handmade item!'}</p>
        </div>
      )}

      {!isLoading && data && data.products.length > 0 && (
        <>
          <ul className="space-y-3">
            {data.products.map((product) => (
              <li
                key={product.id}
                className={`glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${product.isActive ? '' : 'opacity-60'}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <ProductImage src={product.images[0]} alt={product.name} className="w-full h-full" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm text-stone-100 font-medium truncate">{product.name}</p>
                    <p className="text-xs text-[#8ba5a0]">
                      {formatCurrency(product.price)} · {product.category?.name || 'No category'}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                      <span className={product.stock === 0 ? 'text-red-400' : product.stock <= 3 ? 'text-amber-400' : 'text-emerald-400'}>
                        {product.stock === 0 ? 'Sold out' : `${product.stock} in stock`}
                      </span>
                      {!product.isActive && <span className="text-stone-400">Hidden</span>}
                      {product.isFeatured && <span className="text-[#ecc588]">Featured</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:shrink-0">
                  <button
                    onClick={() => toggle(product, 'isFeatured')}
                    title={product.isFeatured ? 'Remove from home page' : 'Feature on home page'}
                    className={`p-2.5 rounded-lg hover:bg-[#0e3f38]/50 cursor-pointer ${product.isFeatured ? 'text-[#ecc588]' : 'text-stone-500'}`}
                  >
                    <Star className="w-4 h-4" fill={product.isFeatured ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => toggle(product, 'isActive')}
                    title={product.isActive ? 'Hide from shop' : 'Show in shop'}
                    className="p-2.5 rounded-lg text-stone-400 hover:bg-[#0e3f38]/50 cursor-pointer"
                  >
                    {product.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    title="Edit"
                    className="p-2.5 rounded-lg text-stone-300 hover:bg-[#0e3f38]/50"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(product)}
                    title="Delete"
                    className="p-2.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-[#0e3f38]/50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#0e3f38] text-stone-300 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-[#8ba5a0]">Page {page} of {data.pagination.totalPages}</span>
              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#0e3f38] text-stone-300 disabled:opacity-40 cursor-pointer"
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
