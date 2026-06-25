import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import type { DashboardStats, Order, Event, EventStats } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Параллельные запросы для сбора статистики
      const [usersRes, ordersRes, productsRes, eventsRes, eventsStatsRes] =
        await Promise.allSettled([
          apiClient.get('/users'),
          apiClient.get('/orders'),
          apiClient.get('/products'),
          apiClient.get('/events'),
          apiClient.get('/events/stats'),
        ]);

      const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
      const orders: Order[] =
        ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];
      const products =
        productsRes.status === 'fulfilled' ? productsRes.value.data : [];
      const recentEvents: Event[] =
        eventsRes.status === 'fulfilled' ? eventsRes.value.data : [];
      const eventStats: EventStats | null =
        eventsStatsRes.status === 'fulfilled' ? eventsStatsRes.value.data : null;

      // Подсчёт выручки (total из заказов со статусом PAID и выше)
      const revenue = orders
        .filter((o) => !['CREATED', 'CANCELED'].includes(o.status))
        .reduce((sum, o) => sum + o.total, 0);

      // Группировка заказов по статусу
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
        ordersByStatus,
        recentOrders: orders.slice(0, 5),
        recentEvents: recentEvents.slice(0, 5),
      });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка данных...</div>;
  if (!stats) return <div className="loading">Ошибка загрузки данных</div>;

  // Цвета для статусов заказов
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
    PENDING: 'Ожидает',
    PAID: 'Оплачен',
    IN_PROGRESS: 'В работе',
    SHIPPED: 'Отгружен',
    DONE: 'Выполнен',
    CANCELED: 'Отменён',
  };

  return (
    <div className="page">
      <h1 className="page-title">Дашборд</h1>

      {/* Карточки со статистикой */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Пользователей</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Заказов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Товаров</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {new Intl.NumberFormat('ru-RU').format(stats.totalRevenue)} ₽
          </div>
          <div className="stat-label">Выручка</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Распределение заказов по статусам */}
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

        {/* Последние заказы */}
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

      {/* Последние события */}
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
                  <td className="text-mono">{event.path || '—'}</td>
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