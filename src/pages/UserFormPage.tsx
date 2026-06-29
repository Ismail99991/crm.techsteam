import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { CrmRole } from '../types';

const roleOptions: { value: CrmRole; label: string }[] = [
  { value: 'SUPERADMIN', label: 'Супер-админ' },
  { value: 'ADMIN', label: 'Администратор' },
  { value: 'MANAGER', label: 'Менеджер' },
  { value: 'LOGIST', label: 'Логист' },
];

export default function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEdit = !!id;

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<CrmRole>('MANAGER');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const { data } = await apiClient.get(`/crm/users/${id}`);
      setEmail(data.email);
      setName(data.name || '');
      setRole(data.role || 'MANAGER');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Record<string, unknown> = { email, name: name || undefined, role };
      if (password) payload.password = password;

      if (isEdit) {
        await apiClient.put(`/crm/users/${id}`, payload);
        addToast('success', 'Сотрудник обновлён');
      } else {
        await apiClient.post('/crm/users', payload);
        addToast('success', 'Сотрудник создан');
      }
      navigate('/users');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <h1 className="page-title">
        {isEdit ? 'Редактирование сотрудника' : 'Пригласить сотрудника'}
      </h1>

      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label htmlFor="name">Имя</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label htmlFor="password">
              {isEdit ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль *'}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              placeholder="Минимум 6 символов"
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label htmlFor="role">Роль *</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as CrmRole)}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn"
              onClick={() => navigate('/users')}
            >
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
