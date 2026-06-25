import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1 className="page-title">Настройки</h1>

      <div className="card" style={{ maxWidth: 480 }}>
        <h2 className="card-title">Профиль</h2>
        <div className="info-list">
          <div className="info-row">
            <span className="info-label">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">ID</span>
            <span className="text-mono">{user?.id}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480, marginTop: '1.5rem' }}>
        <h2 className="card-title">Подключение к API</h2>
        <div className="info-list">
          <div className="info-row">
            <span className="info-label">Сервер</span>
            <span>http://localhost:3001/api</span>
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