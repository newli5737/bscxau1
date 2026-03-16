'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ username, password });
      login(res.token, res.user);
      if (res.user.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%' }} className="animate-in">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="neon-text" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>BscXau</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Đăng nhập để tiếp tục</p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Tên đăng nhập</label>
              <input type="text" className="input-field" placeholder="Nhập tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Mật khẩu</label>
              <input type="password" className="input-field" placeholder="Nhập mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px', color: '#fca5a5', fontSize: '13px' }}>{error}</div>
            )}

            <button type="submit" className="gradient-btn" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '16px' }}>
            Chưa có tài khoản?{' '}
            <Link href="/register" style={{ color: '#00f5d4', textDecoration: 'none' }}>Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
