'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import { UserCircle, Copy, Landmark, LogOut, Edit3, X, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [bank, setBank] = useState({ bankName: '', bankAccountNumber: '', bankAccountHolder: '' });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      setBank({
        bankName: user.bankName || '',
        bankAccountNumber: user.bankAccountNumber || '',
        bankAccountHolder: user.bankAccountHolder || '',
      });
    }
  }, [loading, user, router]);

  const handleSaveBank = async () => {
    setSaving(true);
    setMsg('');
    try {
      await authAPI.updateBank(bank);
      setMsg('Cập nhật thành công!');
      setEditing(false);
      await refreshProfile();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="neon-text">Đang tải...</div></div>;

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }} className="animate-in">
        <UserCircle size={22} color="#00f5d4" />
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Cá nhân</h1>
      </div>

      {/* User Info */}
      <div className="glass-card animate-in" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #00f5d4, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700 }}>
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{user.username}</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>ID: {user.id}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: 'rgba(30,41,59,0.4)', borderRadius: '12px', padding: '12px' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Mã giới thiệu</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <p className="neon-text" style={{ fontWeight: 700, flex: 1 }}>{user.referralCode}</p>
              <button onClick={() => { navigator.clipboard.writeText(user.referralCode); alert('Đã sao chép!'); }}
                style={{ padding: '4px 10px', background: 'rgba(0,245,212,0.15)', borderRadius: '8px', color: '#00f5d4', fontSize: '11px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Copy size={12} /> Sao chép
              </button>
            </div>
          </div>
          <div style={{ background: 'rgba(30,41,59,0.4)', borderRadius: '12px', padding: '12px' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Link mời bạn bè</p>
            <p style={{ fontSize: '12px', color: '#67e8f9', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${user.referralCode}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Bank Info */}
      <div className="glass-card animate-in" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={18} color="#00f5d4" />
            <h3 style={{ fontWeight: 600, fontSize: '15px' }}>Thông tin ngân hàng</h3>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ color: '#00f5d4', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {editing ? <><X size={14} /> Hủy</> : <><Edit3 size={14} /> Sửa</>}
          </button>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Tên ngân hàng</label>
              <input className="input-field" placeholder="VD: Vietcombank" value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Số tài khoản</label>
              <input className="input-field" placeholder="Nhập số tài khoản" value={bank.bankAccountNumber} onChange={(e) => setBank({ ...bank, bankAccountNumber: e.target.value })} />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Tên chủ tài khoản</label>
              <input className="input-field" placeholder="Nhập tên chủ tài khoản" value={bank.bankAccountHolder} onChange={(e) => setBank({ ...bank, bankAccountHolder: e.target.value })} />
            </div>

            {msg && (
              <div style={{ padding: '12px', borderRadius: '12px', fontSize: '13px', background: msg.includes('thành công') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: msg.includes('thành công') ? '#86efac' : '#fca5a5' }}>{msg}</div>
            )}

            <button onClick={handleSaveBank} disabled={saving} className="gradient-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Ngân hàng', value: user.bankName },
              { label: 'Số TK', value: user.bankAccountNumber },
              { label: 'Chủ TK', value: user.bankAccountHolder },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(30,41,59,0.4)', borderRadius: '12px', padding: '12px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.value || 'Chưa cập nhật'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <button onClick={logout} className="animate-in"
        style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontWeight: 500, cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
        <LogOut size={16} /> Đăng xuất
      </button>

      <BottomNav />
    </div>
  );
}
