'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { Settings, BarChart3, Users, Gem, ArrowDownCircle, ArrowUpCircle, Plus, Check, X, ArrowLeft, AlertTriangle, Copy, Edit3, Save, LogOut, Landmark, Trash2, TrendingUp, Bell, RefreshCw } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import './admin.css';

type Tab = 'stats' | 'users' | 'products' | 'investments' | 'deposits' | 'withdrawals' | 'banks';
const validTabs: Tab[] = ['stats', 'users', 'products', 'investments', 'deposits', 'withdrawals', 'banks'];

function getInitialTab(): Tab {
  if (typeof window === 'undefined') return 'stats';
  const hash = window.location.hash.replace('#', '') as Tab;
  return validTabs.includes(hash) ? hash : 'stats';
}

interface Notification { id: number; type: string; message: string; time: Date; }

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTabState] = useState<Tab>(getInitialTab);

  const setTab = (newTab: Tab) => {
    setTabState(newTab);
    window.location.hash = newTab;
  };
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const notiIdRef = useRef(0);

  const [productForm, setProductForm] = useState({
    name: '', description: '', price: 0, roiPercent: 0, dailyProfit: 0, totalProfit: 0, durationDays: 0, paymentDelayHours: 24,
  });
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [editingRefCode, setEditingRefCode] = useState<{ id: number; code: string } | null>(null);
  const [bankForm, setBankForm] = useState({ bankCode: '', bankName: '', accountNumber: '', accountHolder: '' });

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) router.push('/admin/login');
  }, [loading, user, router]);

  // WebSocket connection for notifications
  useEffect(() => {
    if (!user?.isAdmin) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const backendUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const socket = io(`${backendUrl}/ws`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => console.log('🔔 Admin WS connected'));

    socket.on('new-deposit', (data: any) => {
      const n: Notification = {
        id: ++notiIdRef.current,
        type: 'deposit',
        message: `💰 ${data.username} yêu cầu nạp ${(data.amount || 0).toLocaleString('vi-VN')}đ${data.productName ? ` (${data.productName})` : ''}`,
        time: new Date(),
      };
      setNotifications(prev => [n, ...prev].slice(0, 50));
      setUnread(prev => prev + 1);
    });

    socket.on('new-withdraw', (data: any) => {
      const n: Notification = {
        id: ++notiIdRef.current,
        type: 'withdraw',
        message: `🏧 ${data.username} yêu cầu rút ${(data.amount || 0).toLocaleString('vi-VN')}đ`,
        time: new Date(),
      };
      setNotifications(prev => [n, ...prev].slice(0, 50));
      setUnread(prev => prev + 1);
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [user]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    loadData();
  }, [tab, user]);

  const loadData = async () => {
    try {
      switch (tab) {
        case 'stats': setData(await adminAPI.getStats()); break;
        case 'users': setData(await adminAPI.getUsers()); break;
        case 'products': setData(await adminAPI.getProducts()); break;
        case 'investments': setData(await adminAPI.getInvestments()); break;

        case 'deposits': setData(await adminAPI.getPendingDeposits()); break;
        case 'withdrawals': setData(await adminAPI.getPendingWithdrawals()); break;
        case 'banks': setData(await adminAPI.getBankAccounts()); break;
      }
    } catch {}
  };

  const fmt = (n: number) => (n || 0).toLocaleString('vi-VN');
  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleApprove = async (type: string, id: number) => {
    try {
      if (type === 'deposit') await adminAPI.approveDeposit(id);
      else if (type === 'withdrawal') await adminAPI.approveWithdrawal(id);

      showMsg('Đã duyệt!');
      loadData();
    } catch (err: any) { showMsg(err.message); }
  };

  const handleReject = async (type: string, id: number) => {
    const note = prompt('Lý do từ chối:', 'Chưa đủ điều kiện');
    if (note === null) return; // User cancelled
    try {
      if (type === 'deposit') await adminAPI.rejectDeposit(id, note || 'Chưa đủ điều kiện');
      else if (type === 'withdrawal') await adminAPI.rejectWithdrawal(id, note || 'Chưa đủ điều kiện');

      showMsg('Đã từ chối!');
      loadData();
    } catch (err: any) { showMsg(err.message); }
  };

  const createProduct = async () => {
    try {
      await adminAPI.createProduct(productForm);
      showMsg('Tạo gói đầu tư thành công!');
      setProductForm({ name: '', description: '', price: 0, roiPercent: 0, dailyProfit: 0, totalProfit: 0, durationDays: 0, paymentDelayHours: 24 });
      setShowProductDialog(false);
      loadData();
    } catch (err: any) { showMsg(err.message); }
  };

  const updateProduct = async () => {
    if (!editingProduct) return;
    try {
      await adminAPI.updateProduct(editingProduct.id, productForm);
      showMsg('Đã cập nhật gói đầu tư!');
      setEditingProduct(null);
      setShowProductDialog(false);
      loadData();
    } catch (err: any) { showMsg(err.message); }
  };

  const openEditProduct = (p: any) => {
    setEditingProduct(p);
    setProductForm({ name: p.name, description: p.description || '', price: p.price, roiPercent: p.roiPercent, dailyProfit: p.dailyProfit, totalProfit: p.totalProfit, durationDays: p.durationDays, paymentDelayHours: p.paymentDelayHours });
    setShowProductDialog(true);
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: 0, roiPercent: 0, dailyProfit: 0, totalProfit: 0, durationDays: 0, paymentDelayHours: 24 });
    setShowProductDialog(true);
  };

  const handleSaveRefCode = async () => {
    if (!editingRefCode) return;
    try {
      await adminAPI.updateReferralCode(editingRefCode.id, editingRefCode.code);
      showMsg('Đã cập nhật mã giới thiệu!');
      setEditingRefCode(null);
      loadData();
    } catch (err: any) { showMsg(err.message); }
  };



  if (loading || !user?.isAdmin) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="neon-text">Đang tải...</div></div>;

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'stats', label: 'Thống kê', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'products', label: 'Gói ĐT', icon: Gem },
    { key: 'investments', label: 'ĐT User', icon: TrendingUp },
    { key: 'deposits', label: 'Nạp', icon: ArrowDownCircle },
    { key: 'withdrawals', label: 'Rút', icon: ArrowUpCircle },
    { key: 'banks', label: 'NH', icon: Landmark },
  ];

  return (
    <div style={{ padding: '24px 16px 32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={22} color="#00f5d4" />
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Admin Panel</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) setUnread(0); }} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(0,245,212,0.2)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#00f5d4', position: 'relative' }}>
              <Bell size={18} />
              {unread > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread > 9 ? '9+' : unread}</span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '300px', maxHeight: '400px', overflowY: 'auto', background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(0,245,212,0.2)', borderRadius: '12px', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(30,41,59,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>Thông báo</span>
                  {notifications.length > 0 && (
                    <button onClick={() => setNotifications([])} style={{ fontSize: '11px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa tất cả</button>
                  )}
                </div>
                {notifications.length === 0 && (
                  <p style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Chưa có thông báo</p>
                )}
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(30,41,59,0.3)', fontSize: '12px' }}>
                    <p style={{ marginBottom: '2px' }}>{n.message}</p>
                    <p style={{ color: '#64748b', fontSize: '10px' }}>{n.time.toLocaleTimeString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logout icon */}
          <button onClick={logout} title="Đăng xuất" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#f87171' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {msg && <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '12px', fontSize: '13px', background: 'rgba(0,245,212,0.1)', color: '#67e8f9', border: '1px solid rgba(0,245,212,0.2)' }}>{msg}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              background: tab === t.key ? 'rgba(0,245,212,0.2)' : 'rgba(30,41,59,0.5)', color: tab === t.key ? '#00f5d4' : '#94a3b8',
            }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      {tab === 'stats' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Tổng users', value: data.totalUsers, color: '#00f5d4' },
              { label: 'Nghi ngờ', value: data.suspiciousUsers, color: '#f87171' },
              { label: 'Tổng nạp', value: fmt(data.totalDeposits) + ' đ', color: '#4ade80' },
              { label: 'Tổng rút', value: fmt(data.totalWithdrawals) + ' đ', color: '#f97316' },
              { label: 'Tổng đầu tư', value: fmt(data.totalInvestments) + ' đ', color: '#c084fc' },
            ].map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: '16px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>{s.label}</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
          {data.topIps?.length > 0 && (
            <div className="glass-card" style={{ padding: '16px' }}>
              <h3 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>Top IP đăng ký</h3>
              {data.topIps.map((ip: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', borderBottom: '1px solid rgba(30,41,59,0.5)' }}>
                  <span style={{ color: '#cbd5e1' }}>{ip.ip}</span>
                  <span style={{ color: '#00f5d4' }}>{ip.count} lần</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && data?.users && (
        <div className="admin-cards-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.users.map((u: any) => (
            <div key={u.id} className="glass-card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '14px' }}>
                    {u.username} {u.isAdmin && <span style={{ color: '#00f5d4' }}>(Admin)</span>}
                    {u.isSuspicious && <AlertTriangle size={14} color="#f87171" style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>IP: {u.registrationIp || 'N/A'} | F1: {u._count.referrals}</p>
                </div>
                <p className="neon-text" style={{ fontSize: '14px', fontWeight: 700 }}>{fmt(u.balance)} đ</p>
              </div>
              {/* Referral code row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', background: 'rgba(30,41,59,0.4)', borderRadius: '8px', padding: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>Mã GT:</span>
                {editingRefCode?.id === u.id ? (
                  <>
                    <input className="input-field" style={{ padding: '4px 8px', fontSize: '12px', flex: 1 }} value={editingRefCode!.code} onChange={e => setEditingRefCode({ id: u.id, code: e.target.value })} />
                    <button onClick={handleSaveRefCode} style={{ padding: '4px 8px', background: 'rgba(34,197,94,0.2)', color: '#4ade80', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Save size={12} /></button>
                    <button onClick={() => setEditingRefCode(null)} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={12} /></button>
                  </>
                ) : (
                  <>
                    <span className="neon-text" style={{ fontSize: '12px', fontWeight: 600, flex: 1 }}>{u.referralCode}</span>
                    <button onClick={() => { navigator.clipboard.writeText(u.referralCode); showMsg('Đã sao chép!'); }} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#67e8f9' }}><Copy size={12} /></button>
                    <button onClick={() => setEditingRefCode({ id: u.id, code: u.referralCode })} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Edit3 size={12} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Trang {data.page}/{data.totalPages} ({data.total} users)</p>
        </div>
      )}

      {/* Products */}
      {tab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={openCreateProduct} className="gradient-btn admin-btn-compact" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Plus size={16} /> Tạo gói đầu tư mới
          </button>
          <div className="admin-cards-grid">
          {Array.isArray(data) && data.map((p: any) => (
            <div key={p.id} className="glass-card" style={{ padding: '12px', cursor: 'pointer' }} onClick={() => openEditProduct(p)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '14px' }}>{p.name}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>{fmt(p.price)} đ | ROI {p.roiPercent}% | {p.durationDays} ngày</p>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>LN/ngày: {fmt(p.dailyProfit)} đ | Tổng: {fmt(p.totalProfit)} đ</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: p.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: p.isActive ? '#4ade80' : '#f87171' }}>{p.isActive ? 'Active' : 'Off'}</span>
                  <Edit3 size={14} color="#94a3b8" />
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Product Dialog */}
      {showProductDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }} onClick={() => setShowProductDialog(false)}>
          <div className="glass-card" style={{ padding: '20px', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 600, fontSize: '16px' }}>{editingProduct ? 'Sửa gói đầu tư' : 'Tạo gói đầu tư'}</h3>
              <button onClick={() => setShowProductDialog(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input className="input-field" placeholder="Tên gói" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
              <input className="input-field" placeholder="Mô tả" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div><label style={{ fontSize: '11px', color: '#94a3b8' }}>Giá (đ)</label><input type="number" className="input-field" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} /></div>
                <div><label style={{ fontSize: '11px', color: '#94a3b8' }}>ROI %</label><input type="number" className="input-field" value={productForm.roiPercent || ''} onChange={e => setProductForm({...productForm, roiPercent: Number(e.target.value)})} /></div>
                <div><label style={{ fontSize: '11px', color: '#94a3b8' }}>LN/ngày</label><input type="number" className="input-field" value={productForm.dailyProfit || ''} onChange={e => setProductForm({...productForm, dailyProfit: Number(e.target.value)})} /></div>
                <div><label style={{ fontSize: '11px', color: '#94a3b8' }}>Tổng LN</label><input type="number" className="input-field" value={productForm.totalProfit || ''} onChange={e => setProductForm({...productForm, totalProfit: Number(e.target.value)})} /></div>
                <div><label style={{ fontSize: '11px', color: '#94a3b8' }}>Số ngày</label><input type="number" className="input-field" value={productForm.durationDays || ''} onChange={e => setProductForm({...productForm, durationDays: Number(e.target.value)})} /></div>
                <div><label style={{ fontSize: '11px', color: '#94a3b8' }}>Hoàn tiền (h)</label><input type="number" className="input-field" value={productForm.paymentDelayHours || ''} onChange={e => setProductForm({...productForm, paymentDelayHours: Number(e.target.value)})} /></div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {editingProduct ? (
                  <>
                    <button onClick={updateProduct} className="gradient-btn" style={{ flex: 1 }}>Lưu thay đổi</button>
                    <button onClick={async () => { try { await adminAPI.deleteProduct(editingProduct.id); showMsg('Đã xóa!'); setShowProductDialog(false); loadData(); } catch(e:any) { showMsg(e.message); } }} style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600 }}><Trash2 size={16} /></button>
                  </>
                ) : (
                  <button onClick={createProduct} className="gradient-btn" style={{ flex: 1 }}>Tạo gói</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Investments */}
      {tab === 'investments' && Array.isArray(data) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="admin-cards-grid">
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Tổng: {data.length} lượt đầu tư</p>
          {data.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>Chưa có đầu tư nào</p>}
          {data.map((inv: any) => (
            <div key={inv.id} className="glass-card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{inv.user?.username || 'N/A'}</p>
                  <p style={{ fontSize: '12px', color: '#00f5d4' }}>{inv.product?.name || 'N/A'}</p>
                </div>
                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '6px',
                  background: inv.status === 'active' ? 'rgba(34,197,94,0.15)' : inv.status === 'completed' ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.15)',
                  color: inv.status === 'active' ? '#4ade80' : inv.status === 'completed' ? '#60a5fa' : '#94a3b8',
                }}>{inv.status === 'active' ? 'Đang chạy' : inv.status === 'completed' ? 'Hoàn thành' : inv.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px', color: '#94a3b8' }}>
                <p>Vốn: <span style={{ color: '#e2e8f0' }}>{(inv.amount || 0).toLocaleString('vi-VN')} đ</span></p>
                <p>LN/ngày: <span style={{ color: '#4ade80' }}>{(inv.dailyProfit || 0).toLocaleString('vi-VN')} đ</span></p>
                <p>Bắt đầu: {new Date(inv.startDate).toLocaleDateString('vi-VN')}</p>
                <p>Kết thúc: {new Date(inv.endDate).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Deposits */}
      {tab === 'deposits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Yêu cầu nạp tiền chờ duyệt</p>
            <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'rgba(0,245,212,0.1)', color: '#00f5d4', borderRadius: '8px', border: '1px solid rgba(0,245,212,0.2)', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
              <RefreshCw size={13} /> Tải lại
            </button>
          </div>
          {!Array.isArray(data) && <p style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>Đang tải...</p>}
          {Array.isArray(data) && data.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>Không có yêu cầu nạp</p>}
          {Array.isArray(data) && data.map((d: any) => (
            <div key={d.id} className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '14px' }}>{d.user?.username || 'N/A'}</p>
                <p className="neon-text" style={{ fontSize: '13px' }}>{fmt(d.amount)} đ</p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>{new Date(d.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleApprove('deposit', d.id)} style={{ padding: '6px 12px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Duyệt</button>
                <button onClick={() => handleReject('deposit', d.id)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Từ chối</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Withdrawals */}
      {tab === 'withdrawals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Yêu cầu rút tiền chờ duyệt</p>
            <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'rgba(0,245,212,0.1)', color: '#00f5d4', borderRadius: '8px', border: '1px solid rgba(0,245,212,0.2)', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
              <RefreshCw size={13} /> Tải lại
            </button>
          </div>
          {!Array.isArray(data) && <p style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>Đang tải...</p>}
          {Array.isArray(data) && data.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>Không có yêu cầu rút</p>}
          {Array.isArray(data) && data.map((w: any) => (
            <div key={w.id} className="glass-card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '14px' }}>{w.user?.username || 'N/A'}</p>
                  <p className="neon-text" style={{ fontSize: '13px' }}>{fmt(w.amount)} đ</p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleApprove('withdrawal', w.id)} style={{ padding: '6px 12px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Duyệt</button>
                  <button onClick={() => handleReject('withdrawal', w.id)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Từ chối</button>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Gem size={12} /> {w.bankName} - {w.bankAccountNumber}</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Users size={12} /> {w.bankAccountHolder}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banks */}
      {tab === 'banks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card admin-form-wide" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Plus size={16} color="#00f5d4" />
              <h3 style={{ fontWeight: 600, fontSize: '14px' }}>Thêm tài khoản ngân hàng</h3>
            </div>
            <div className="admin-form-inline" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select className="input-field" value={bankForm.bankCode} onChange={e => {
                const opt = e.target.options[e.target.selectedIndex];
                setBankForm({...bankForm, bankCode: e.target.value, bankName: opt.dataset.name || e.target.value });
              }}>
                <option value="">-- Chọn ngân hàng --</option>
                {[{c:'MBBank',n:'MB Bank'},{c:'VCB',n:'Vietcombank'},{c:'TCB',n:'Techcombank'},{c:'ACB',n:'ACB'},{c:'BIDV',n:'BIDV'},{c:'VietinBank',n:'VietinBank'},{c:'TPBank',n:'TPBank'},{c:'VPBank',n:'VPBank'},{c:'SHB',n:'SHB'},{c:'MSB',n:'MSB'},{c:'Agribank',n:'Agribank'},{c:'Sacombank',n:'Sacombank'},{c:'HDBank',n:'HDBank'},{c:'OCB',n:'OCB'},{c:'LienVietPostBank',n:'LienVietPostBank'},{c:'SeABank',n:'SeABank'},{c:'VIB',n:'VIB'},{c:'Eximbank',n:'Eximbank'},{c:'NCB',n:'NCB'},{c:'NamABank',n:'NamABank'}]
                  .map(b => <option key={b.c} value={b.c} data-name={b.n}>{b.n}</option>)}
              </select>
              <input className="input-field" placeholder="Số tài khoản" value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} />
              <input className="input-field" placeholder="Tên chủ tài khoản" value={bankForm.accountHolder} onChange={e => setBankForm({...bankForm, accountHolder: e.target.value})} />
              <button onClick={async () => {
                if (!bankForm.bankCode || !bankForm.accountNumber || !bankForm.accountHolder) { showMsg('Vui lòng nhập đầy đủ'); return; }
                try {
                  await adminAPI.createBankAccount(bankForm);
                  showMsg('Đã thêm tài khoản!');
                  setBankForm({ bankCode: '', bankName: '', accountNumber: '', accountHolder: '' });
                  loadData();
                } catch(err: any) { showMsg(err.message); }
              }} className="gradient-btn admin-btn-submit">Thêm tài khoản</button>
            </div>
          </div>
          {Array.isArray(data) && data.map((b: any) => (
            <div key={b.id} className="glass-card" style={{ padding: '12px', opacity: b.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontWeight: 500, fontSize: '14px' }}>{b.bankName}</p>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                      background: b.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: b.isActive ? '#4ade80' : '#f87171',
                      border: `1px solid ${b.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}>{b.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>{b.accountNumber} - {b.accountHolder}</p>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Code: {b.bankCode}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={async () => {
                    try {
                      await adminAPI.updateBankAccount(b.id, { isActive: !b.isActive });
                      showMsg(b.isActive ? 'Đã tắt tài khoản!' : 'Đã kích hoạt tài khoản!');
                      loadData();
                    } catch(err: any) { showMsg(err.message); }
                  }} title={b.isActive ? 'Tắt' : 'Kích hoạt'} style={{
                    padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 500,
                    background: b.isActive ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                    color: b.isActive ? '#fbbf24' : '#4ade80',
                  }}>
                    {b.isActive ? 'Tắt' : 'Bật'}
                  </button>
                  <button onClick={async () => {
                    try { await adminAPI.deleteBankAccount(b.id); showMsg('Đã xóa!'); loadData(); }
                    catch(err: any) { showMsg(err.message); }
                  }} style={{ padding: '6px', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
