import { useState, useEffect } from 'react';
import apiClient, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { CallbackRequest } from '../types';

const statusColors: Record<string, string> = {
  NEW: '#3b82f6',
  CONTACTED: '#f59e0b',
  CLOSED: '#10b981',
};

const statusLabels: Record<string, string> = {
  NEW: 'Новая',
  CONTACTED: 'Связались',
  CLOSED: 'Закрыта',
};

export default function CallbackRequestsPage() {
  const { addToast } = useToast();
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCallbacks();
  }, []);

  const loadCallbacks = async () => {
    try {
      const { data } = await apiClient.get('/callbacks');
      setCallbacks(data);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiClient.put(`/callbacks/${id}/status`, { status: newStatus });
      setCallbacks((prev) =>
        prev.map((cb) => (cb.id === id ? { ...cb, status: newStatus } : cb))
      );
      addToast('success', 'Статус обновлён');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <h1 className="page-title">Заявки на обратный звонок</h1>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Комментарий</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {callbacks.map((cb) => (
                <tr key={cb.id}>
                  <td>{cb.name}</td>
                  <td>{cb.phone}</td>
                  <td>{cb.comment || '-'}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusColors[cb.status] || '#999' }}
                    >
                      {statusLabels[cb.status] || cb.status}
                    </span>
                  </td>
                  <td>
                    {new Date(cb.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td>
                    {cb.status === 'NEW' && (
                      <button
                        className="btn btn-sm"
                        onClick={() => handleStatusChange(cb.id, 'CONTACTED')}
                      >
                        Связались
                      </button>
                    )}
                    {cb.status === 'CONTACTED' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleStatusChange(cb.id, 'CLOSED')}
                      >
                        Закрыть
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {callbacks.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">
                    Нет заявок
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
