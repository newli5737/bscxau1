'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '', referralCode: '', captchaAnswer: '',
  });
  const [captcha, setCaptcha] = useState({ id: '', image: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const loadCaptcha = async () => {
    try {
      const c = await authAPI.getCaptcha();
      setCaptcha(c);
      setForm(f => ({ ...f, captchaAnswer: '' }));
    } catch {}
  };

  useEffect(() => { loadCaptcha(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        ...form,
        captchaId: captcha.id,
      });
      login(res.token, res.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ width: '100%' }} className="animate-in">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="neon-text" style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>BscXau</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Tạo tài khoản mới</p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Tên đăng nhập</label>
              <input type="text" className="input-field" placeholder="Ít nhất 3 ký tự" value={form.username} onChange={update('username')} required minLength={3} />
            </div>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Mật khẩu</label>
              <input type="password" className="input-field" placeholder="Ít nhất 6 ký tự" value={form.password} onChange={update('password')} required minLength={6} />
            </div>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Nhập lại mật khẩu</label>
              <input type="password" className="input-field" placeholder="Xác nhận mật khẩu" value={form.confirmPassword} onChange={update('confirmPassword')} required />
            </div>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                Mã giới thiệu <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input type="text" className="input-field" placeholder="Nhập mã giới thiệu" value={form.referralCode} onChange={update('referralCode')} required />
            </div>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '8px', display: 'block' }}>Mã xác nhận</label>
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {captcha.image ? (
                  <img src={captcha.image} alt="captcha" style={{ height: '50px', borderRadius: '8px', border: '1px solid rgba(0,245,212,0.2)' }} />
                ) : (
                  <div style={{ height: '50px', width: '150px', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>Đang tải...</div>
                )}
                <button type="button" onClick={loadCaptcha} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(0,245,212,0.2)', cursor: 'pointer', color: '#00f5d4', display: 'flex', alignItems: 'center' }}>
                  <RefreshCw size={18} />
                </button>
              </div>
              <input type="text" className="input-field" placeholder="Nhập kết quả phép tính" value={form.captchaAnswer} onChange={update('captchaAnswer')} required />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px', color: '#fca5a5', fontSize: '13px' }}>{error}</div>
            )}

            <button type="submit" className="gradient-btn" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '16px' }}>
            Đã có tài khoản?{' '}
            <Link href="/login" style={{ color: '#00f5d4', textDecoration: 'none' }}>Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
