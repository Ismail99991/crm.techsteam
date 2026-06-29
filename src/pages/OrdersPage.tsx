import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import type { Order } from '../types';

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await apiClient.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <h1 className="page-title">Заказы</h1>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Клиент</th>
                <th>Статус</th>
                <th>Сумма</th>
                <th>Товаров</th>
                <th>Дата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="text-mono">{order.id.slice(0, 8)}...</td>
                  <td>{order.marketUser?.email || '-'}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: statusColors[order.status] || '#999',
                      }}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td>{order.total.toLocaleString('ru-RU')} ₽</td>
                  <td>{order.items.length}</td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td>
                    <Link to={`/orders/${order.id}`} className="btn btn-sm">
                      Подробнее
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted">
                    Нет заказов
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
