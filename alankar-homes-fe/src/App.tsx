import { Provider } from 'react-redux';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { store } from './app/store';
import { MainLayout } from './components/layout/MainLayout';
import { RequireAdmin, RequireAuth } from './components/layout/RouteGuards';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { HomePage } from './pages/shop/HomePage';
import { ProductsPage } from './pages/shop/ProductsPage';
import { ProductDetailsPage } from './pages/shop/ProductDetailsPage';
import { CartPage } from './pages/shop/CartPage';
import { CheckoutPage } from './pages/shop/CheckoutPage';
import { OrdersPage } from './pages/shop/OrdersPage';
import { OrderDetailsPage } from './pages/shop/OrderDetailsPage';
import { WishlistPage } from './pages/shop/WishlistPage';
import { ProfilePage } from './pages/shop/ProfilePage';
import { CustomOrdersPage } from './pages/custom/CustomOrdersPage';
import { CustomOrderFormPage } from './pages/custom/CustomOrderFormPage';
import { CustomOrderDetailsPage } from './pages/custom/CustomOrderDetailsPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomOrdersPage } from './pages/admin/AdminCustomOrdersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { ROUTES } from './utils/constants';

const NotFoundPage = () => (
  <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
    <h1 className="font-serif text-3xl text-[#ecc588]">Page not found</h1>
    <p className="text-sm text-[#8ba5a0]">The page you're looking for doesn't exist.</p>
    <Link to={ROUTES.HOME} className="inline-block text-sm text-[#caa060] hover:text-[#ecc588]">Go to home page</Link>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

          <Route element={<MainLayout />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
            <Route path={ROUTES.PRODUCT_DETAILS} element={<ProductDetailsPage />} />
            <Route path={ROUTES.CART} element={<CartPage />} />
            <Route path={ROUTES.CUSTOM_ORDERS} element={<CustomOrdersPage />} />

            <Route element={<RequireAuth />}>
              <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
              <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
              <Route path={ROUTES.ORDER_DETAILS} element={<OrderDetailsPage />} />
              <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.NEW_CUSTOM_ORDER} element={<CustomOrderFormPage />} />
              <Route path={ROUTES.CUSTOM_ORDER_DETAILS} element={<CustomOrderDetailsPage />} />
            </Route>

            <Route element={<RequireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
                <Route path={ROUTES.ADMIN_PRODUCTS} element={<AdminProductsPage />} />
                <Route path={ROUTES.ADMIN_NEW_PRODUCT} element={<AdminProductFormPage />} />
                <Route path={ROUTES.ADMIN_EDIT_PRODUCT} element={<AdminProductFormPage />} />
                <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
                <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrdersPage />} />
                <Route path={ROUTES.ADMIN_CUSTOM_ORDERS} element={<AdminCustomOrdersPage />} />
                <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
