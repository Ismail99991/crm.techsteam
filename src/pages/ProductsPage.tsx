import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Product } from '../types';

export default function ProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    apiClient
      .get('/products')
      .then((res) => setProducts(res.data))
      .catch((err) => addToast('error', getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [addToast]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/admin/products/${deleteTarget.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      addToast('success', `Товар <${deleteTarget.title}> удалён`);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Товары</h1>
        <Link to="/admin/products/new" className="btn btn-primary">
          + Создать
        </Link>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Изображение</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Тип цены</th>
                <th>Артикул</th>
                <th>Активен</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0].url}
                        alt=""
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>{p.title}</td>
                  <td>{p.category?.name || '-'}</td>
                  <td>{p.priceType === 'FIXED' ? `${p.price} ₽` : '-'}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        background: p.priceType === 'FIXED' ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {p.priceType === 'FIXED' ? 'Фиксированная' : 'Запрос'}
                    </span>
                  </td>
                  <td>{p.article || '-'}</td>
                  <td>
                    <span
                      className="status-dot"
                      style={{ background: p.isActive ? '#10b981' : '#ef4444' }}
                    />
                  </td>
                  <td>
                    <div className="actions">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="btn btn-sm"
                      >
                        Редактировать
                      </Link>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleteTarget(p)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-muted">
                    Нет товаров
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Удаление товара"
        message={
          deleteTarget
            ? `Вы уверены, что хотите удалить товар <${deleteTarget.title}>? Это действие необратимо.`
            : ''
        }
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
