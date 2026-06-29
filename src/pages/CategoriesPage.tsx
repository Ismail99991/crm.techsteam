import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Category } from '../types';

export default function CategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  useEffect(() => {
    apiClient
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => addToast('error', getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [addToast]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/admin/categories/${deleteTarget.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      addToast('success', `Категория <${deleteTarget.name}> удалена`);
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
        <h1 className="page-title">Категории</h1>
        <Link to="/admin/categories/new" className="btn btn-primary">
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
                <th>Slug</th>
                <th>Заголовок</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    {cat.image ? (
                      <img
                        src={cat.image.url}
                        alt=""
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>{cat.name}</td>
                  <td className="text-mono">{cat.slug}</td>
                  <td>{cat.title || '-'}</td>
                  <td>
                    <div className="actions">
                      <Link
                        to={`/admin/categories/${cat.id}/edit`}
                        className="btn btn-sm"
                      >
                        Редактировать
                      </Link>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleteTarget(cat)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">
                    Нет категорий
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Удаление категории"
        message={
          deleteTarget
            ? `Вы уверены, что хотите удалить категорию <${deleteTarget.name}>? Товары в этой категории останутся без категории.`
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
