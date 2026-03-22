'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { investmentAPI } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import { Gem, Calendar, TrendingUp, Clock } from 'lucide-react';

interface Product {
  id: number; name: string; description: string; price: number;
  roiPercent: number; dailyProfit: number; totalProfit: number;
  durationDays: number; paymentDelayHours: number;
}

export default function InvestPage() {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [buying, setBuying] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    investmentAPI.getProducts().then(setProducts).catch(() => {});
  }, []);

  const handleBuy = async (id: number) => {
    if (!confirm('Bạn chắc chắn muốn mua gói đầu tư này?')) return;
    setBuying(id);
    setMsg('');
    try {
      await investmentAPI.buy(id);
      setMsg('Mua thành công!');
      await refreshProfile();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setBuying(null);
    }
  };

  const fmt = (n: number) => n.toLocaleString('vi-VN');

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="neon-text">Đang tải...</div></div>;

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }} className="animate-in">
        <TrendingUp size={22} color="#ff4757" />
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Gói đầu tư</h1>
      </div>

      {msg && (
        <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '12px', fontSize: '13px', background: msg.includes('thành công') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: msg.includes('thành công') ? '#86efac' : '#fca5a5', border: `1px solid ${msg.includes('thành công') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>
        {products.map((p, i) => (
          <Link key={p.id} href={`/invest/${p.id}`} className="glass-card animate-in" style={{ padding: '20px', animationDelay: `${i * 0.1}s`, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #eab308, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gem size={22} color="white" />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '15px' }}>{p.name}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>{p.description}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '12px', padding: '12px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Giá</p>
                <p className="neon-text" style={{ fontWeight: 700, fontSize: '14px' }}>{fmt(p.price)} đ</p>
              </div>
              <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '12px', padding: '12px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Tỷ lệ hoàn vốn</p>
                <p style={{ fontWeight: 700, color: '#4ade80', fontSize: '14px' }}>{p.roiPercent}%</p>
              </div>
              <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '12px', padding: '12px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Lợi nhuận/ngày</p>
                <p style={{ fontWeight: 700, color: '#67e8f9', fontSize: '14px' }}>{fmt(p.dailyProfit)} đ</p>
              </div>
              <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '12px', padding: '12px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Thời hạn</p>
                <p style={{ fontWeight: 700, color: '#c084fc', fontSize: '14px' }}>{p.durationDays} ngày</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', background: 'rgba(30,41,59,0.3)', borderRadius: '12px', padding: '12px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Tổng lợi nhuận</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#facc15' }}>{fmt(p.totalProfit)} đ</p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1' }}>
                <Clock size={14} />
                <span style={{ fontSize: '13px' }}>{p.paymentDelayHours}h</span>
              </div>
            </div>

            <button onClick={() => handleBuy(p.id)} disabled={buying === p.id} className="gradient-btn">
              {buying === p.id ? 'Đang xử lý...' : 'Mua ngay'}
            </button>
          </Link>
        ))}

        {products.length === 0 && (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
            <Gem size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p>Chưa có gói đầu tư nào</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
