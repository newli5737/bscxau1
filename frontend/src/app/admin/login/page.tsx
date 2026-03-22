'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ username, password });
      if (!res.user.isAdmin) {
        setError('Tài khoản không có quyền truy cập Admin');
        return;
      }
      login(res.token, res.user);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-in">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(0,245,212,0.2), rgba(0,187,249,0.2))',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(0,245,212,0.3)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f5d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
            <span style={{ color: '#00f5d4' }}>Admin</span> Panel
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Đăng nhập quản trị viên</p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Tên đăng nhập</label>
              <input
                type="text"
                className="input-field"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Mật khẩu</label>
              <input
                type="password"
                className="input-field"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px', color: '#fca5a5', fontSize: '13px' }}>{error}</div>
            )}

            <button type="submit" className="gradient-btn" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
