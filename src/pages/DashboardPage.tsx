import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import type { DashboardStats, Order, AppEvent, QuoteRequest } from '../types';

const statusColors: Record<string, string> = {
  CREATED: '#6b7280',
  PENDING: '#f59e0b',
  PAID: '#10b981',
  IN_PROGRESS: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DONE: '#059669',
  CANCELED: '#ef4444',
};

const statusLabels: Record<string, string> = {
  CREATED: 'Создан',
  PENDING: 'В обработке',
  PAID: 'Оплачен',
  IN_PROGRESS: 'В работе',
  SHIPPED: 'Отгружен',
  DONE: 'Выполнен',
  CANCELED: 'Отменён',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const results = await Promise.allSettled([
        apiClient.get('/market/users'),
        apiClient.get('/market/orders'),
        apiClient.get('/products'),
        apiClient.get('/events'),
        apiClient.get('/market/quote-request'),
        apiClient.get('/market/callback'),
      ]);

      const users = results[0].status === 'fulfilled' ? results[0].value.data : [];
      const orders: Order[] = results[1].status === 'fulfilled' ? results[1].value.data : [];
      const products = results[2].status === 'fulfilled' ? results[2].value.data : [];
      const recentEvents: AppEvent[] = results[3].status === 'fulfilled' ? results[3].value.data : [];
      const recentQuoteRequests: QuoteRequest[] = results[4].status === 'fulfilled' ? results[4].value.data : [];
      const callbacks = results[5].status === 'fulfilled' ? results[5].value.data : [];

      const revenue = orders
        .filter((o) => !['CREATED', 'CANCELED'].includes(o.status))
        .reduce((sum, o) => sum + o.total, 0);

      const statusCount: Record<string, number> = {};
      orders.forEach((o) => {
        statusCount[o.status] = (statusCount[o.status] || 0) + 1;
      });
      const ordersByStatus = Object.entries(statusCount).map(
        ([status, count]) => ({
          status: status as Order['status'],
          _count: count,
        })
      );

      setStats({
        totalUsers: users.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue: revenue,
        totalQuoteRequests: recentQuoteRequests.length,
        totalCallbacks: Array.isArray(callbacks) ? callbacks.length : 0,
        ordersByStatus,
        recentOrders: orders.slice(0, 5),
        recentEvents: recentEvents.slice(0, 5),
        recentQuoteRequests: recentQuoteRequests.slice(0, 5),
      });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка данных...</div>;
  if (!stats) return <div className="loading">Не удалось загрузить данные</div>;

  return (
    <div className="page">
      <h1 className="page-title">Панель управления</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Клиенты (B2B)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Заказы</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Товары</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {new Intl.NumberFormat('ru-RU').format(stats.totalRevenue)} ₽
          </div>
          <div className="stat-label">Выручка</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalQuoteRequests}</div>
          <div className="stat-label">Запросы КП</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalCallbacks}</div>
          <div className="stat-label">Заявки на звонок</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Статусы заказов</h2>
          <div className="status-list">
            {stats.ordersByStatus.map((s) => (
              <div key={s.status} className="status-row">
                <div className="status-info">
                  <span
                    className="status-dot"
                    style={{ backgroundColor: statusColors[s.status] || '#999' }}
                  />
                  <span>{statusLabels[s.status] || s.status}</span>
                </div>
                <span className="status-count">{s._count}</span>
              </div>
            ))}
            {stats.ordersByStatus.length === 0 && (
              <p className="text-muted">Нет заказов</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Последние заказы</h2>
            <Link to="/orders" className="btn btn-sm">
              Все заказы
            </Link>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Статус</th>
                  <th>Сумма</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="text-mono">{order.id.slice(0, 8)}...</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor:
                            statusColors[order.status] || '#999',
                        }}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td>{order.total.toLocaleString('ru-RU')} ₽</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-muted">
                      Нет заказов
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 className="card-title">Последние события</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Тип</th>
                <th>Путь</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <span className="event-type">{event.type}</span>
                  </td>
                  <td className="text-mono">{event.path || '-'}</td>
                  <td>
                    {new Date(event.createdAt).toLocaleString('ru-RU')}
                  </td>
                </tr>
              ))}
              {stats.recentEvents.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-muted">
                    Нет событий
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
