import { useState, useEffect } from 'react';
import apiClient, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { MarketUser } from '../types';

export default function MarketUsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<MarketUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await apiClient.get('/market/users');
      setUsers(data);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <h1 className="page-title">Клиенты (B2B)</h1>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Заказов</th>
                <th>Запросов КП</th>
                <th>Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.name || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{user._count?.orders ?? 0}</td>
                  <td>{user._count?.quotes ?? 0}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">
                    Нет зарегистрированных клиентов
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
