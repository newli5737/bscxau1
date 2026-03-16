'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { investmentAPI, walletAPI } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, TrendingUp, Copy, X } from 'lucide-react';

interface Product {
  id: number; name: string; description: string; price: number;
  roiPercent: number; dailyProfit: number; totalProfit: number;
  durationDays: number; paymentDelayHours: number;
}

export default function InvestDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [buying, setBuying] = useState(false);
  const [msg, setMsg] = useState('');
  const [qrData, setQrData] = useState<any>(null);
  const [countdown, setCountdown] = useState(600);

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user && productId) {
      investmentAPI.getProducts().then((products: Product[]) => {
        const found = products.find(p => p.id === productId);
        if (found) setProduct(found);
        else router.push('/invest');
      }).catch(() => router.push('/invest'));

      walletAPI.getBalance().then((b: any) => setBalance(b.balance || 0)).catch(() => {});
    }
  }, [user, productId, router]);

  // Countdown for QR
  useEffect(() => {
    if (!qrData) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(qrData.expiresAt).getTime() - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) { clearInterval(timer); setQrData(null); setMsg('Mã QR đã hết hạn. Vui lòng thử lại.'); }
    }, 1000);
    return () => clearInterval(timer);
  }, [qrData]);

  const handleBuy = async () => {
    setBuying(true);
    setMsg('');
    try {
      if (balance >= product!.price) {
        // Buy directly using balance
        await investmentAPI.buy(productId);
        setMsg('Mua gói đầu tư thành công! 🎉');
        // Refresh balance
        walletAPI.getBalance().then((b: any) => setBalance(b.balance || 0)).catch(() => {});
      } else {
        // Not enough balance → show QR deposit
        const result = await walletAPI.createDeposit(product!.price, productId);
        setQrData(result);
        setCountdown(600);
      }
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setBuying(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setMsg('Đã sao chép!');
    setTimeout(() => setMsg(''), 2000);
  };

  const fmt = (n: number) => n.toLocaleString('vi-VN');
  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading || !user || !product) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="neon-text">Đang tải...</div></div>;

  return (
    <div style={{ padding: '24px 16px' }}>
      <button onClick={() => router.push('/invest')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00f5d4', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Quay lại
      </button>

      {/* QR Modal */}
      {qrData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-card" style={{ maxWidth: '380px', width: '100%', padding: '24px', position: 'relative' }}>
            <button onClick={() => setQrData(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <h3 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Thanh toán mua {product.name}</h3>

            {/* Countdown */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '4px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                ⏱ {fmtTime(countdown)}
              </span>
            </div>

            {/* QR Image */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '8px', marginBottom: '16px', textAlign: 'center' }}>
              <img src={qrData.qrUrl} alt="QR Code" style={{ width: '100%', maxWidth: '250px' }} />
            </div>

            {/* Bank Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                { label: 'Ngân hàng', value: qrData.bankAccount.bankName },
                { label: 'Số TK', value: qrData.bankAccount.accountNumber, copy: true },
                { label: 'Chủ TK', value: qrData.bankAccount.accountHolder },
                { label: 'Số tiền', value: `${fmt(qrData.amount)} đ`, copy: true, copyVal: String(qrData.amount) },
                { label: 'Nội dung CK', value: qrData.transferContent, copy: true },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.5)', borderRadius: '8px', padding: '10px 12px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>{r.label}</p>
                    <p style={{ fontSize: '13px', fontWeight: 500 }}>{r.value}</p>
                  </div>
                  {r.copy && (
                    <button onClick={() => copyText(r.copyVal || r.value)} style={{ background: 'rgba(0,245,212,0.15)', border: 'none', color: '#00f5d4', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Copy size={12} /> Sao chép
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
              Quét mã QR hoặc chuyển khoản theo thông tin trên. Admin sẽ duyệt và tự động kích hoạt gói đầu tư.
            </p>
          </div>
        </div>
      )}

      <div className="glass-card animate-in" style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>{product.name}</h1>
        </div>

        {/* Logo */}
        <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #00f5d4, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '14px' }}>Palantir</p>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>— for Builders</p>
          </div>
        </div>

        {/* Product Name */}
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>{product.name}</h2>

        {/* Details Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '20px' }}>
          {[
            { label: 'Tỷ lệ hoàn vốn', value: `${product.roiPercent}%`, color: '#4ade80' },
            { label: 'Thời hạn', value: `${product.durationDays} Ngày`, color: '#4ade80' },
            { label: 'Lợi nhuận hàng ngày', value: `₫ ${fmt(product.dailyProfit)}`, color: '#4ade80' },
            { label: 'Tổng lợi nhuận', value: `₫ ${fmt(product.totalProfit)}`, color: '#4ade80' },
            { label: 'Thời gian hoàn tiền', value: `${product.paymentDelayHours}H`, color: '#e2e8f0' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? '1px solid rgba(148,163,184,0.1)' : 'none' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>{row.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: row.color }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Message */}
        {msg && (
          <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '12px', fontSize: '13px', background: msg.includes('thành công') || msg.includes('sao chép') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: msg.includes('thành công') || msg.includes('sao chép') ? '#86efac' : '#fca5a5' }}>
            {msg}
          </div>
        )}

        {/* Balance info */}
        <div style={{ marginBottom: '12px', padding: '10px 12px', background: 'rgba(30,41,59,0.5)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: '#94a3b8' }}>Số dư hiện tại</span>
          <span style={{ color: balance >= product.price ? '#4ade80' : '#f87171', fontWeight: 600 }}>₫{fmt(balance)}</span>
        </div>

        {/* Buy Button */}
        <button onClick={handleBuy} disabled={buying} className="gradient-btn" style={{ fontSize: '16px', padding: '14px' }}>
          {buying ? 'Đang xử lý...' : balance >= product.price ? `Mua ngay • ₫${fmt(product.price)}` : `Nạp tiền & Mua • ₫${fmt(product.price)}`}
        </button>

        {/* Tagline */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '18px', fontWeight: 700, color: '#e2e8f0', lineHeight: '1.5' }}>
          {product.description}
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
