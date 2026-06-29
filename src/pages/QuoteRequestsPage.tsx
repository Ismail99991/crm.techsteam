import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

export default function QuoteRequestsPage() {
  const { addToast } = useToast();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const { data } = await apiClient.get('/quotes');
      setQuotes(data);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <h1 className="page-title">Запросы КП</h1>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Клиент</th>
                <th>Товар</th>
                <th>Статус</th>
                <th>Дата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id}>
                  <td className="text-mono">{quote.id.slice(0, 8)}...</td>
                  <td>{quote.marketUser?.email || '-'}</td>
                  <td>{quote.product?.title || quote.productId || '-'}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: quoteStatusColors[quote.status] || '#999',
                      }}
                    >
                      {quoteStatusLabels[quote.status] || quote.status}
                    </span>
                  </td>
                  <td>
                    {new Date(quote.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td>
                    <Link to={`/quotes/${quote.id}`} className="btn btn-sm">
                      Подробнее
                    </Link>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">
                    Нет запросов КП
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
