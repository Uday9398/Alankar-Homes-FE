import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, HandHeart, Sparkles, Truck } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { fetchCategories, fetchProducts } from '../../features/shop/shopService';
import { ProductCard } from '../../features/shop/components/ProductCard';
import { ErrorMessage, Spinner } from '../../components/common/Feedback';
import { Logo } from '../../components/common/Logo';
import { ROUTES } from '../../utils/constants';

export const HomePage: React.FC = () => {
  // Featured items first; fall back to the newest items if none are featured yet
  const products = useAsync(async () => {
    const featured = await fetchProducts({ featured: true, limit: 8 });
    if (featured.products.length > 0) return featured.products;
    return (await fetchProducts({ limit: 8 })).products;
  }, []);
  const categories = useAsync(fetchCategories, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-radial-teal">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-28 flex flex-col items-center text-center gap-6">
          <Logo />
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#8ba5a0] uppercase">Handmade with love</p>
          <h1 className="font-serif text-3xl md:text-5xl text-[#ecc588] font-medium tracking-wide max-w-3xl leading-tight">
            Thoughtful gifts, crafted by hand
          </h1>
          <p className="text-sm text-[#8ba5a0]/85 max-w-xl leading-relaxed">
            Every piece at Alankar Homes is made by hand in small batches, so the gift you give is as unique as the person receiving it.
          </p>
          <Link
            to={ROUTES.PRODUCTS}
            className="mt-2 inline-flex items-center gap-2 py-3.5 px-7 bg-gold-gradient text-stone-950 font-semibold rounded-lg text-sm hover:shadow-lg transition-all"
          >
            Shop the collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Promises */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 md:-mt-10 relative z-10">
        <div className="glass-card rounded-2xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#0e3f38]/70">
          {[
            { icon: <HandHeart className="w-5 h-5" />, title: '100% handmade', text: 'Crafted piece by piece' },
            { icon: <Gift className="w-5 h-5" />, title: 'Gift ready', text: 'Lovingly packed for gifting' },
            { icon: <Truck className="w-5 h-5" />, title: 'Cash on delivery', text: 'Pay when it reaches you' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4 p-5 md:p-6">
              <div className="text-[#caa060]">{item.icon}</div>
              <div>
                <p className="text-sm text-stone-100 font-medium">{item.title}</p>
                <p className="text-xs text-[#8ba5a0]/80">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.data && categories.data.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 mt-16">
          <h2 className="font-serif text-2xl text-[#ecc588] mb-6">Shop by category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.data.map((category) => (
              <Link
                key={category.id}
                to={`${ROUTES.PRODUCTS}?category=${category.id}`}
                className="glass-card rounded-full px-5 py-2.5 text-sm text-stone-200 hover:border-[#caa060]/60 hover:text-[#ecc588] transition-colors"
              >
                {category.name}
                {category.productCount !== undefined && (
                  <span className="ml-2 text-xs text-[#8ba5a0]">{category.productCount}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-16">
        <div className="flex items-end justify-between mb-6 gap-4">
          <h2 className="font-serif text-2xl text-[#ecc588]">Our favourites</h2>
          <Link to={ROUTES.PRODUCTS} className="text-xs font-semibold text-[#caa060] hover:text-[#ecc588] flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {products.isLoading && <Spinner />}
        {products.error && <ErrorMessage message={products.error} onRetry={products.reload} />}
        {products.data && products.data.length === 0 && (
          <p className="text-sm text-[#8ba5a0] py-10 text-center">New handmade pieces are coming soon. Check back shortly!</p>
        )}
        {products.data && products.data.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Custom orders */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-16">
        <div className="glass-card rounded-2xl p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
          <div className="space-y-2 max-w-xl">
            <p className="text-[10px] font-bold tracking-[0.25em] text-[#8ba5a0] uppercase flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Made just for you
            </p>
            <h2 className="font-serif text-2xl md:text-3xl text-[#ecc588]">Have something special in mind?</h2>
            <p className="text-sm text-[#8ba5a0] leading-relaxed">
              Share your idea and a few photos. We'll send you a price, and once you're happy we'll handcraft it just for you.
            </p>
          </div>
          <Link
            to={ROUTES.CUSTOM_ORDERS}
            className="shrink-0 inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-gold-gradient text-stone-950 font-semibold rounded-lg text-sm hover:shadow-lg transition-all"
          >
            Request a custom piece <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
