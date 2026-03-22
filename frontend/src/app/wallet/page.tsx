'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { walletAPI } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle, Copy, QrCode, Timer } from 'lucide-react';

interface DepositOrder {
  id: number; amount: number; transferContent: string; expiresAt: string; qrUrl: string; status: string;
  bankAccount: { bankCode: string; bankName: string; accountNumber: string; accountHolder: string };
}

export default function WalletPage() {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [depositOrder, setDepositOrder] = useState<DepositOrder | null>(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      walletAPI.getDeposits().then(setDeposits).catch(() => {});
      walletAPI.getWithdrawals().then(setWithdrawals).catch(() => {});
    }
  }, [user]);

  // Countdown timer
  useEffect(() => {
    if (!depositOrder) return;
    const interval = setInterval(() => {
      const remaining = new Date(depositOrder.expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        setCountdown('Hết hạn');
        clearInterval(interval);
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [depositOrder]);

  const handleDeposit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) { setMsg('Số tiền không hợp lệ'); return; }
    setSubmitting(true);
    setMsg('');
    try {
      const order = await walletAPI.createDeposit(num);
      setDepositOrder(order);
      setAmount('');
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const num = Number(amount);
    if (!num || num <= 0) { setMsg('Số tiền không hợp lệ'); return; }
    setSubmitting(true);
    setMsg('');
    try {
      await walletAPI.withdraw(num);
      setMsg('Yêu cầu rút tiền đã được gửi! Chờ admin duyệt.');
      setAmount('');
      walletAPI.getWithdrawals().then(setWithdrawals);
      await refreshProfile();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setMsg('Đã sao chép!');
    setTimeout(() => setMsg(''), 2000);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'completed' || status === 'approved') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: '11px' }}><CheckCircle size={12} /> Hoàn thành</span>;
    if (status === 'rejected') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '20px', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '11px' }}><XCircle size={12} /> Từ chối</span>;
    if (status === 'expired') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '20px', background: 'rgba(107,114,128,0.15)', color: '#9ca3af', fontSize: '11px' }}><Clock size={12} /> Hết hạn</span>;
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '20px', background: 'rgba(234,179,8,0.15)', color: '#facc15', fontSize: '11px' }}><Clock size={12} /> Chờ duyệt</span>;
  };

  const fmt = (n: number) => (n || 0).toLocaleString('vi-VN');

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="neon-text">Đang tải...</div></div>;

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }} className="animate-in">
        <Wallet size={22} color="#ff4757" />
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Ví của tôi</h1>
      </div>

      {/* Balance */}
      <div className="glass-card pulse-glow animate-in" style={{ padding: '20px', marginBottom: '20px' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>Số dư</p>
        <p className="neon-text" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>{fmt(user.balance)} đ</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Thu nhập hôm nay</p>
            <p style={{ fontWeight: 600, color: '#4ade80' }}>{fmt(user.todayIncome)} đ</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Tổng thu nhập</p>
            <p style={{ fontWeight: 600, color: '#67e8f9' }}>{fmt(user.totalIncome)} đ</p>
          </div>
        </div>
      </div>

      {/* QR Deposit Order Modal */}
      {depositOrder && (
        <div className="glass-card animate-in" style={{ padding: '20px', marginBottom: '20px', border: '1px solid rgba(255,71,87,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={18} color="#ff4757" />
              <h3 style={{ fontWeight: 600, fontSize: '15px' }}>Quét QR để chuyển khoản</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: countdown === 'Hết hạn' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)', color: countdown === 'Hết hạn' ? '#f87171' : '#facc15' }}>
              <Timer size={14} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{countdown}</span>
            </div>
          </div>

          {/* QR Image */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img src={depositOrder.qrUrl} alt="QR Code" style={{ maxWidth: '100%', width: '280px', borderRadius: '12px', border: '2px solid rgba(255,71,87,0.2)' }} />
          </div>

          {/* Bank Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Ngân hàng', value: depositOrder.bankAccount.bankName },
              { label: 'Số tài khoản', value: depositOrder.bankAccount.accountNumber, copy: true },
              { label: 'Chủ tài khoản', value: depositOrder.bankAccount.accountHolder },
              { label: 'Số tiền', value: `${fmt(depositOrder.amount)} đ` },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.5)', borderRadius: '8px', padding: '10px 12px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.value}</span>
                  {item.copy && <button onClick={() => copyText(String(item.value))} style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer', color: '#67e8f9' }}><Copy size={12} /></button>}
                </div>
              </div>
            ))}
          </div>

          {/* Transfer Content */}
          <div style={{ background: 'linear-gradient(135deg, rgba(255,71,87,0.1), rgba(14,165,233,0.1))', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px dashed rgba(255,71,87,0.3)' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Nội dung chuyển khoản (bắt buộc)</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <p className="neon-text" style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px' }}>{depositOrder.transferContent}</p>
              <button onClick={() => copyText(depositOrder.transferContent)} style={{ padding: '6px', background: 'rgba(255,71,87,0.15)', borderRadius: '8px', border: 'none', cursor: 'pointer', color: '#ff4757' }}>
                <Copy size={16} />
              </button>
            </div>
          </div>

          <button onClick={() => setDepositOrder(null)} style={{ width: '100%', marginTop: '16px', padding: '10px', borderRadius: '12px', background: 'rgba(107,114,128,0.2)', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>
            Đóng
          </button>
        </div>
      )}

      {/* Tab */}
      {!depositOrder && (
        <>
          <div className="animate-in" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={() => { setTab('deposit'); setMsg(''); }}
              style={{ flex: 1, padding: '10px', borderRadius: 12, fontWeight: 500, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.3s', background: tab === 'deposit' ? 'linear-gradient(135deg, #22c55e, #059669)' : 'rgba(30,41,59,0.5)', color: tab === 'deposit' ? 'white' : '#94a3b8' }}>
              <ArrowDownCircle size={16} /> Nạp tiền
            </button>
            <button onClick={() => { setTab('withdraw'); setMsg(''); }}
              style={{ flex: 1, padding: '10px', borderRadius: 12, fontWeight: 500, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.3s', background: tab === 'withdraw' ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'rgba(30,41,59,0.5)', color: tab === 'withdraw' ? 'white' : '#94a3b8' }}>
              <ArrowUpCircle size={16} /> Rút tiền
            </button>
          </div>

          {/* Form */}
          <div className="glass-card animate-in" style={{ padding: '20px', marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '8px', display: 'block' }}>
              Số tiền {tab === 'deposit' ? 'nạp' : 'rút'}
            </label>
            <input type="number" className="input-field" placeholder="Nhập số tiền" value={amount} onChange={(e) => setAmount(e.target.value)} min={1} style={{ marginBottom: '16px' }} />

            {msg && (
              <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '12px', fontSize: '13px', background: msg.includes('gửi') || msg.includes('sao chép') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: msg.includes('gửi') || msg.includes('sao chép') ? '#86efac' : '#fca5a5' }}>
                {msg}
              </div>
            )}

            <button onClick={tab === 'deposit' ? handleDeposit : handleWithdraw} disabled={submitting} className="gradient-btn">
              {submitting ? 'Đang xử lý...' : tab === 'deposit' ? 'Tạo mã QR nạp tiền' : 'Gửi yêu cầu rút'}
            </button>
          </div>

          {/* History */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 600, fontSize: '14px', color: '#cbd5e1', marginBottom: '12px' }}>Lịch sử {tab === 'deposit' ? 'nạp' : 'rút'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(tab === 'deposit' ? deposits : withdrawals).map((item) => (
                <div key={item.id} className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '14px' }}>{fmt(item.amount)} đ</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
              {(tab === 'deposit' ? deposits : withdrawals).length === 0 && (
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '16px' }}>Chưa có lịch sử</p>
              )}
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
