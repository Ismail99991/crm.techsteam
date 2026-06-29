import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="header">
      <h1 className="header-title">TechSteam CRM</h1>
      <div className="header-user">
        <span className="header-email">{user?.email}</span>
      </div>
    </header>
  );
}
