'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TrendingUp, Users, Wallet, User, MessageCircle } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/invest', label: 'Đầu tư', icon: TrendingUp },
  { href: '/team', label: 'Nhóm', icon: Users },
  { href: '/wallet', label: 'Ví', icon: Wallet },
  { href: '/profile', label: 'Cá nhân', icon: User },
  { href: '/support', label: 'Hỗ trợ', icon: MessageCircle },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '420px',
      background: 'rgba(10, 14, 39, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0, 245, 212, 0.2)',
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0' }}>
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 8px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                color: active ? '#00f5d4' : '#94a3b8',
                transform: active ? 'scale(1.1)' : 'scale(1)',
                textDecoration: 'none',
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: '9px', fontWeight: 500 }}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
