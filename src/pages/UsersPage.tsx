import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import type { CrmUser } from '../types';

const roleLabels: Record<string, string> = {
  SUPERADMIN: 'Супер-админ',
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  LOGIST: 'Логист',
};

const roleColors: Record<string, string> = {
  SUPERADMIN: '#ef4444',
  ADMIN: '#3b82f6',
  MANAGER: '#10b981',
  LOGIST: '#f59e0b',
};

export default function UsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<CrmUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CrmUser | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await apiClient.get('/crm/users');
      setUsers(data);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/crm/users/${deleteTarget.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      addToast('success', `Сотрудник ${deleteTarget.email} удалён`);
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
        <h1 className="page-title">Сотрудники CRM</h1>
        <Link to="/users/new" className="btn btn-primary">
          + Пригласить
        </Link>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Имя</th>
                <th>Роль</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.name || '-'}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: roleColors[user.role] || '#999' }}
                    >
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="actions">
                    <Link
                      to={`/users/${user.id}/edit`}
                      className="btn btn-sm"
                    >
                      Редактировать
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteTarget(user)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">
                    Нет сотрудников
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Удаление сотрудника"
        message={
          deleteTarget
            ? `Вы уверены, что хотите удалить сотрудника <${deleteTarget.email}>?`
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
