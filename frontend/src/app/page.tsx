'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { investmentAPI } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import { TrendingUp, ArrowDownToLine, Trophy, Users, ChevronRight, ArrowDownCircle } from 'lucide-react';

// Fake withdrawal data generator
const FAKE_PHONES = [
  '+84 342****17', '+84 909****85', '+84 378****62', '+84 967****03', '+84 888****41',
  '+84 356****29', '+84 912****76', '+84 385****54', '+84 976****18', '+84 839****93',
  '+84 365****47', '+84 903****21', '+84 397****68', '+84 945****35', '+84 871****59',
  '+84 329****84', '+84 918****42', '+84 388****71', '+84 936****06', '+84 857****37',
];
const FAKE_AMOUNTS = [30000, 50000, 100000, 150000, 200000, 300000, 500000, 800000, 1000000, 1500000, 2000000, 5000000];

function generateFakeWithdrawals() {
  const items = [];
  for (let i = 0; i < 20; i++) {
    const phone = FAKE_PHONES[Math.floor(Math.random() * FAKE_PHONES.length)];
    const amount = FAKE_AMOUNTS[Math.floor(Math.random() * FAKE_AMOUNTS.length)];
    items.push({ phone, amount });
  }
  return items;
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [heroSlide, setHeroSlide] = useState(0);
  const fakeWithdrawals = useMemo(() => generateFakeWithdrawals(), []);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      investmentAPI.getProducts().then(p => setProducts(p.slice(0, 5))).catch(() => {});
    }
  }, [user]);

  // Hero auto-rotate
  useEffect(() => {
    const timer = setInterval(() => setHeroSlide(s => (s + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  if (loading || !user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="neon-text" style={{ fontSize: '18px' }}>Đang tải...</div></div>;
  }

  const formatMoney = (n: number) => (n || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div style={{ padding: '24px 16px' }}>
      {/* Header */}
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Xin chào,</p>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>{user.username}</h1>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #00f5d4, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>
          {user.username[0].toUpperCase()}
        </div>
      </div>

      {/* Hero Slider */}
      {(() => {
        const slides = [
          { img: '/hero-1.png', title: 'Kiếm tiền thông minh', desc: 'Đầu tư AI tự động - nhận lợi nhuận hàng ngày' },
          { img: '/hero-2.png', title: 'Đầu tư sinh lời', desc: 'ROI lên đến 33% - lợi nhuận hấp dẫn' },
          { img: '/hero-3.png', title: 'Mời bạn - nhận hoa hồng', desc: 'Hoa hồng 3 cấp, thu nhập thụ động' },
        ];
        return (
          <div className="animate-in" style={{ marginBottom: '20px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'flex', transition: 'transform 0.5s ease', transform: `translateX(-${heroSlide * 100}%)` }}>
              {slides.map((s, i) => (
                <div key={i} style={{ minWidth: '100%', position: 'relative' }}>
                  <img src={s.img} alt={s.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{s.title}</h2>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
              {slides.map((_, i) => (
                <div key={i} onClick={() => setHeroSlide(i)} style={{ width: heroSlide === i ? 16 : 6, height: 6, borderRadius: 3, background: heroSlide === i ? '#00f5d4' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s', cursor: 'pointer' }} />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Marquee - Fake Withdrawals */}
      <div className="animate-in" style={{ marginBottom: '20px', overflow: 'hidden', borderRadius: '12px', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(0,245,212,0.1)', padding: '10px 0' }}>
        <div style={{ display: 'flex', animation: 'marquee-scroll 10s linear infinite', whiteSpace: 'nowrap' }}>
          {[...fakeWithdrawals, ...fakeWithdrawals].map((item, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginRight: '32px', flexShrink: 0 }}>
              <ArrowDownCircle size={14} color="#4ade80" />
              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Người dùng {item.phone} rút <span style={{ color: '#4ade80', fontWeight: 600 }}>₫{item.amount.toLocaleString('vi-VN')}</span>
              </span>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Balance Card */}
      <div className="glass-card pulse-glow animate-in" style={{ padding: '20px', marginBottom: '20px' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>Số dư tài khoản</p>
        <p className="neon-text" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>{formatMoney(user.balance)}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>Thu nhập hôm nay</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#4ade80' }}>{formatMoney(user.todayIncome)}</p>
          </div>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>Tổng thu nhập</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#67e8f9' }}>{formatMoney(user.totalIncome)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {[
          { href: '/invest', icon: TrendingUp, label: 'Đầu tư', color: '#00f5d4' },
          { href: '/team', icon: Users, label: 'Nhóm', color: '#00bbf9' },
          { href: '/wallet', icon: ArrowDownToLine, label: 'Ví tiền', color: '#a78bfa' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="glass-card animate-in" style={{ padding: '16px', textAlign: 'center', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <Icon size={28} color={item.color} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0' }}>{item.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Investment Products Section */}
      {products.length > 0 && (
        <div className="animate-in" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="#00f5d4" />
              <h3 style={{ fontWeight: 600, fontSize: '15px' }}>Gói đầu tư nổi bật</h3>
            </div>
            <Link href="/invest" style={{ color: '#00f5d4', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {products.map((p) => (
              <Link key={p.id} href={`/invest/${p.id}`} className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #00f5d4, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingUp size={18} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>ROI {p.roiPercent}% • {p.durationDays} ngày • +{(p.dailyProfit || 0).toLocaleString('vi-VN')} đ/ngày</p>
                </div>
                <ChevronRight size={16} color="#94a3b8" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <Link href="/invest" className="glass-card animate-in" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={22} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 500 }}>Hệ thống gói đầu tư AI</p>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Tự động hóa dựa trên trí tuệ nhân tạo</p>
          </div>
          <span style={{ color: '#00f5d4', fontSize: '14px' }}>Xem →</span>
        </Link>
        <Link href="/team" className="glass-card animate-in" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #f97316, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 500 }}>Mời bạn bè nhận thưởng</p>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Hoa hồng 3 cấp, lên đến 32%</p>
          </div>
          <span style={{ color: '#00f5d4', fontSize: '14px' }}>Xem →</span>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
