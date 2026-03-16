'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 9));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (phone.length !== 9) {
      setError('Số điện thoại phải đủ 9 số');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ username: `+84${phone}`, password });
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
          <img src="/logo.png" alt="BscXau" style={{ width: '80px', height: '80px', marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Đăng nhập để tiếp tục</p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Số điện thoại</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(0,245,212,0.15)', borderRadius: '10px', padding: '10px 12px', color: '#00f5d4', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>+84</span>
                <input type="tel" className="input-field" placeholder="Nhập 9 số" value={phone} onChange={handlePhoneChange} required style={{ flex: 1 }} />
              </div>
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
