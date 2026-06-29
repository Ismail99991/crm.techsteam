import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../api/client';
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

const allowedTransitions: Record<string, string[]> = {
  CREATED: ['PENDING', 'CANCELED'],
  PENDING: ['PAID', 'CANCELED'],
  PAID: ['IN_PROGRESS', 'CANCELED'],
  IN_PROGRESS: ['SHIPPED'],
  SHIPPED: ['DONE'],
  DONE: [],
  CANCELED: [],
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const { data } = await apiClient.get(`/orders/${id}`);
      setOrder(data);
    } catch {
      setError('Заказ не найден');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { data } = await apiClient.put(`/orders/${id}/status`, {
        status: newStatus,
      });
      setOrder(data);
      addToast('success', `Статус изменён на "${statusLabels[newStatus] || newStatus}"`);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить заказ?')) return;
    try {
      await apiClient.delete(`/orders/${id}`);
      addToast('success', 'Заказ удалён');
      navigate('/orders');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error || !order)
    return <div className="loading">{error || 'Заказ не найден'}</div>;

  const nextStatuses = allowedTransitions[order.status] || [];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Заказ #{order.id.slice(0, 8)}</h1>
        <button className="btn btn-danger" onClick={handleDelete}>
          Удалить
        </button>
      </div>

      <div className="order-detail-grid">
        <div className="card">
          <h2 className="card-title">Информация</h2>
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">ID</span>
              <span className="text-mono">{order.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Клиент</span>
              <span>{order.marketUser?.email || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Статус</span>
              <span
                className="status-badge"
                style={{
                  backgroundColor: statusColors[order.status] || '#999',
                }}
              >
                {statusLabels[order.status] || order.status}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Сумма</span>
              <span className="text-bold">
                {order.total.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Создан</span>
              <span>{new Date(order.createdAt).toLocaleString('ru-RU')}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Обновлён</span>
              <span>{new Date(order.updatedAt).toLocaleString('ru-RU')}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Изменить статус</h2>
          {nextStatuses.length > 0 ? (
            <div className="status-actions">
              {nextStatuses.map((status) => (
                <button
                  key={status}
                  className="btn"
                  style={{
                    borderColor: statusColors[status] || '#999',
                    color: statusColors[status] || '#999',
                  }}
                  onClick={() => handleStatusChange(status)}
                >
                  {statusLabels[status] || status}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted">Нет доступных переходов</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 className="card-title">Состав заказа</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Количество</th>
                <th>Цена</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product?.title || item.productId}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price.toLocaleString('ru-RU')} ₽</td>
                  <td>
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-bold">
                  Итого
                </td>
                <td className="text-bold">
                  {order.total.toLocaleString('ru-RU')} ₽
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
