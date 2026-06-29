import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// CRM — сотрудники
import UsersPage from './pages/UsersPage';
import UserFormPage from './pages/UserFormPage';

// B2B — клиенты
import MarketUsersPage from './pages/MarketUsersPage';

// Заказы
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';

// КП
import QuoteRequestsPage from './pages/QuoteRequestsPage';
import QuoteRequestDetailPage from './pages/QuoteRequestDetailPage';

// Заявки на звонок
import CallbackRequestsPage from './pages/CallbackRequestsPage';

// Категории
import CategoriesPage from './pages/CategoriesPage';
import CategoryFormPage from './pages/CategoryFormPage';

// Товары
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';

// Настройки
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Защищённые маршруты внутри Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />

              {/* CRM — сотрудники */}
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/new" element={<UserFormPage />} />
              <Route path="/users/:id/edit" element={<UserFormPage />} />

              {/* B2B — клиенты */}
              <Route path="/market-users" element={<MarketUsersPage />} />

              {/* Заказы */}
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />

              {/* КП */}
              <Route path="/quotes" element={<QuoteRequestsPage />} />
              <Route path="/quotes/:id" element={<QuoteRequestDetailPage />} />

              {/* Заявки на звонок */}
              <Route path="/callbacks" element={<CallbackRequestsPage />} />

              {/* Категории */}
              <Route path="/admin/categories" element={<CategoriesPage />} />
              <Route path="/admin/categories/new" element={<CategoryFormPage />} />
              <Route path="/admin/categories/:id/edit" element={<CategoryFormPage />} />

              {/* Товары */}
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/products/new" element={<ProductFormPage />} />
              <Route path="/admin/products/:id/edit" element={<ProductFormPage />} />

              {/* Настройки */}
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
