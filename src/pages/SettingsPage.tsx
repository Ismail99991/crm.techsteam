import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import AvatarUpload from '../components/AvatarUpload';

export default function SettingsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      addToast('error', 'Пароль должен быть не менее 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('error', 'Пароли не совпадают');
      return;
    }

    setSaving(true);
    try {
      await apiClient.put('/crm/auth/password', {
        currentPassword,
        newPassword,
      });
      addToast('success', 'Пароль изменён');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Настройки</h1>

      <div className="card" style={{ maxWidth: 480 }}>
        <h2 className="card-title">Профиль</h2>

        <div className="mb-3 d-flex flex-column align-items-center">
          <AvatarUpload
            currentAvatarUrl={avatarUrl || user?.avatar?.url}
            onAvatarChange={(url) => setAvatarUrl(url)}
          />
        </div>

        <div className="info-list">
          <div className="info-row">
            <span className="info-label">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Имя</span>
            <span>{user?.name || '-'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Роль</span>
            <span>{user?.role}</span>
          </div>
          <div className="info-row">
            <span className="info-label">ID</span>
            <span className="text-mono">{user?.id}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480, marginTop: '1.5rem' }}>
        <h2 className="card-title">Смена пароля</h2>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Текущий пароль</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Подтвердите пароль</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Сохранение...' : 'Изменить пароль'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 480, marginTop: '1.5rem' }}>
        <h2 className="card-title">Подключение к API</h2>
        <div className="info-list">
          <div className="info-row">
            <span className="info-label">Сервер</span>
            <span>{import.meta.env.VITE_API_URL || '/api'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Статус</span>
            <span className="status-badge" style={{ backgroundColor: '#10b981' }}>
              Активно
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
