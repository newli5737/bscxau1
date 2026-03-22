'use client';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { MessageCircle, Headphones, Clock, Shield, ExternalLink } from 'lucide-react';

export default function SupportPage() {
  const [supportUrl, setSupportUrl] = useState('');

  useEffect(() => {
    fetch('/api/auth/support-url')
      .then(r => r.json())
      .then(d => setSupportUrl(d.url || ''))
      .catch(() => {});
  }, []);

  return (
    <div style={{ padding: '24px 16px' }}>
      <div className="animate-in" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #ff4757, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Headphones size={28} color="white" />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Trung tâm hỗ trợ</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
      </div>

      {/* Info cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {[
          { icon: Clock, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ CSKH hoạt động liên tục, sẵn sàng giải đáp mọi thắc mắc của bạn bất kể ngày đêm.', color: '#ff4757' },
          { icon: Shield, title: 'Bảo mật thông tin', desc: 'Mọi thông tin cá nhân và giao dịch của bạn được bảo mật tuyệt đối với hệ thống mã hóa tiên tiến.', color: '#a78bfa' },
          { icon: MessageCircle, title: 'Phản hồi nhanh chóng', desc: 'Cam kết phản hồi trong vòng 5 phút qua kênh Telegram chính thức.', color: '#facc15' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="glass-card animate-in" style={{ padding: '16px', display: 'flex', gap: '14px', animationDelay: `${i * 0.1}s` }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={item.color} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="animate-in" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Câu hỏi thường gặp</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { q: 'Làm sao để nạp tiền?', a: 'Vào gói đầu tư → Mua ngay → Quét mã QR để chuyển khoản. Admin sẽ duyệt và kích hoạt gói tự động.' },
            { q: 'Khi nào nhận được lợi nhuận?', a: 'Lợi nhuận được cộng hàng ngày vào tài khoản sau khi gói đầu tư được kích hoạt.' },
            { q: 'Làm sao để rút tiền?', a: 'Vào Ví → Rút tiền → Nhập số tiền. Cần cập nhật thông tin ngân hàng trước khi rút.' },
            { q: 'Mời bạn bè nhận thưởng thế nào?', a: 'Vào Cá nhân → sao chép mã giới thiệu. Bạn bè đăng ký bằng mã của bạn, bạn nhận hoa hồng 3 cấp.' },
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: '14px' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#ff4757' }}>❓ {item.q}</p>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Button */}
      {supportUrl && (
        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-btn animate-in"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontSize: '16px', padding: '14px' }}
        >
          <MessageCircle size={20} />
          Liên hệ qua Telegram
          <ExternalLink size={14} />
        </a>
      )}

      {!supportUrl && (
        <div className="glass-card animate-in" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
          <p>Chưa có kênh hỗ trợ. Vui lòng liên hệ admin.</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
