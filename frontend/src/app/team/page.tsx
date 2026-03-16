'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { referralAPI } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import { Users, Copy, UserPlus } from 'lucide-react';

interface LevelStats { level: number; count: number; todayCommission: number; totalIncome: number; rate: string; }
interface TeamData { totalReferrals: number; todayCommission: number; totalIncome: number; levels: LevelStats[]; }

export default function TeamPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState<TeamData | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user) referralAPI.getTeam().then(setTeam).catch(() => {});
  }, [user]);

  const fmt = (n: number) => n.toLocaleString('vi-VN');

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="neon-text">Đang tải...</div></div>;

  const levelColors = ['linear-gradient(135deg, #22c55e, #059669)', 'linear-gradient(135deg, #3b82f6, #6366f1)', 'linear-gradient(135deg, #a855f7, #ec4899)'];

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }} className="animate-in">
        <Users size={22} color="#00f5d4" />
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Nhóm của tôi</h1>
      </div>

      {/* Overview */}
      <div className="glass-card animate-in" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
          <div>
            <p className="neon-text" style={{ fontSize: '22px', fontWeight: 700 }}>{team?.totalReferrals || 0}</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Tổng giới thiệu</p>
          </div>
          <div>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#4ade80' }}>{fmt(team?.todayCommission || 0)}</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>HH hôm nay</p>
          </div>
          <div>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#67e8f9' }}>{fmt(team?.totalIncome || 0)}</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Tổng thu nhập</p>
          </div>
        </div>
      </div>

      {/* Commission Rates */}
      <div className="glass-card animate-in" style={{ padding: '16px', marginBottom: '20px' }}>
        <h3 style={{ fontWeight: 600, fontSize: '14px', color: '#cbd5e1', marginBottom: '12px' }}>Tỷ lệ hoa hồng</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Giới thiệu trực tiếp (Cấp 1)', rate: '32%', color: '#4ade80' },
            { label: 'Giới thiệu gián tiếp (Cấp 2)', rate: '3%', color: '#60a5fa' },
            { label: 'Giới thiệu gián tiếp (Cấp 3)', rate: '1%', color: '#c084fc' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.4)', borderRadius: '12px', padding: '12px' }}>
              <span style={{ fontSize: '13px' }}>{item.label}</span>
              <span style={{ fontWeight: 700, color: item.color }}>{item.rate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Level Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}>
        {(team?.levels || []).map((lv, i) => (
          <div key={lv.level} className="glass-card animate-in" style={{ padding: '16px', animationDelay: `${0.2 + i * 0.08}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: levelColors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white' }}>
                LV{lv.level}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>Cấp {lv.level} - {lv.rate}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>{lv.count} người</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(30,41,59,0.4)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>HH hôm nay</p>
                <p style={{ fontWeight: 700, fontSize: '13px', color: '#4ade80' }}>{fmt(lv.todayCommission)} đ</p>
              </div>
              <div style={{ background: 'rgba(30,41,59,0.4)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Tổng thu nhập</p>
                <p style={{ fontWeight: 700, fontSize: '13px', color: '#67e8f9' }}>{fmt(lv.totalIncome)} đ</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="glass-card animate-in" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <UserPlus size={16} color="#00f5d4" />
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>Link mời bạn bè</p>
        </div>
        <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: '#67e8f9', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${user.referralCode}` : ''}
          </p>
          <button
            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user.referralCode}`); alert('Đã sao chép!'); }}
            style={{ padding: '6px 12px', background: 'rgba(0,245,212,0.15)', borderRadius: '8px', color: '#00f5d4', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Copy size={14} /> Sao chép
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
