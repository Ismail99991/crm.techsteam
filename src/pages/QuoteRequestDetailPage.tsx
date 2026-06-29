import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { QuoteRequest } from '../types';

const quoteStatusColors: Record<string, string> = {
  NEW: '#3b82f6',
  REVIEW: '#f59e0b',
  SENT: '#10b981',
  ACCEPTED: '#059669',
  REJECTED: '#ef4444',
};

const quoteStatusLabels: Record<string, string> = {
  NEW: 'Новый',
  REVIEW: 'В рассмотрении',
  SENT: 'Отправлено',
  ACCEPTED: 'Принят',
  REJECTED: 'Отклонён',
};

const allowedTransitions: Record<string, string[]> = {
  NEW: ['REVIEW', 'REJECTED'],
  REVIEW: ['SENT', 'REJECTED'],
  SENT: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
};

export default function QuoteRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    try {
      const { data } = await apiClient.get(`/quotes/${id}`);
      setQuote(data);
    } catch {
      addToast('error', 'Запрос КП не найден');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { data } = await apiClient.put(`/quotes/${id}/status`, {
        status: newStatus,
      });
      setQuote(data);
      addToast('success', `Статус изменён на "${quoteStatusLabels[newStatus] || newStatus}"`);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!quote) return <div className="loading">Запрос КП не найден</div>;

  const nextStatuses = allowedTransitions[quote.status] || [];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Запрос КП #{quote.id.slice(0, 8)}</h1>
      </div>

      <div className="order-detail-grid">
        <div className="card">
          <h2 className="card-title">Информация</h2>
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">ID</span>
              <span className="text-mono">{quote.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Клиент</span>
              <span>{quote.marketUser?.email || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Товар</span>
              <span>{quote.product?.title || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Статус</span>
              <span
                className="status-badge"
                style={{
                  backgroundColor: quoteStatusColors[quote.status] || '#999',
                }}
              >
                {quoteStatusLabels[quote.status] || quote.status}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Создан</span>
              <span>{new Date(quote.createdAt).toLocaleString('ru-RU')}</span>
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
                    borderColor: quoteStatusColors[status] || '#999',
                    color: quoteStatusColors[status] || '#999',
                  }}
                  onClick={() => handleStatusChange(status)}
                >
                  {quoteStatusLabels[status] || status}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted">Нет доступных переходов</p>
          )}
        </div>
      </div>

      {quote.message && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 className="card-title">Сообщение клиента</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{quote.message}</p>
        </div>
      )}

      {quote.payload && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 className="card-title">Конфигурация</h2>
          <pre className="text-mono" style={{ fontSize: '0.8rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
            {JSON.stringify(quote.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
