'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { taskAPI } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Globe, Link2, Bot, ClipboardList, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Task { id: number; title: string; description: string; reward: number; taskType: string; }
interface TaskCompletion { id: number; taskId: number; status: string; }

export default function TaskDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const taskId = Number(params.id);
  const [task, setTask] = useState<Task | null>(null);
  const [myTasks, setMyTasks] = useState<TaskCompletion[]>([]);
  const [completing, setCompleting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user && taskId) {
      taskAPI.getById(taskId).then(setTask).catch(() => router.push('/tasks'));
      taskAPI.getMy().then(setMyTasks).catch(() => {});
    }
  }, [user, taskId, router]);

  const handleComplete = async () => {
    setCompleting(true);
    setMsg('');
    try {
      await taskAPI.complete(taskId);
      setMsg('Đã gửi yêu cầu! Chờ admin duyệt.');
      taskAPI.getMy().then(setMyTasks);
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setCompleting(false);
    }
  };

  const status = myTasks.find(t => t.taskId === taskId)?.status;

  const taskTypeIcon: Record<string, any> = { web_view: Globe, click_link: Link2, ai_trading: Bot };
  const taskTypeLabel: Record<string, string> = { web_view: 'Xem trang web', click_link: 'Click link', ai_trading: 'AI Trading' };

  if (loading || !user || !task) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="neon-text">Đang tải...</div></div>;

  const TaskIcon = taskTypeIcon[task.taskType] || ClipboardList;

  return (
    <div style={{ padding: '24px 16px' }}>
      <button onClick={() => router.push('/tasks')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00f5d4', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div className="glass-card animate-in" style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TaskIcon size={26} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{task.title}</h1>
            <span style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(30,41,59,0.5)', padding: '4px 10px', borderRadius: '20px' }}>{taskTypeLabel[task.taskType] || task.taskType}</span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div style={{ background: 'rgba(30,41,59,0.4)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>{task.description}</p>
          </div>
        )}

        {/* Reward */}
        <div style={{ background: 'linear-gradient(135deg, rgba(0,245,212,0.1), rgba(14,165,233,0.1))', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'center', border: '1px solid rgba(0,245,212,0.2)' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Phần thưởng</p>
          <p className="neon-text" style={{ fontSize: '24px', fontWeight: 700 }}>+{task.reward.toLocaleString('vi-VN')} đ</p>
        </div>

        {/* Status / Action */}
        {msg && (
          <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '12px', fontSize: '13px', background: msg.includes('gửi') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: msg.includes('gửi') ? '#86efac' : '#fca5a5' }}>
            {msg}
          </div>
        )}

        {status === 'approved' && (
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 500 }}>
            <CheckCircle size={18} /> Đã hoàn thành
          </div>
        )}
        {status === 'pending' && (
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(234,179,8,0.15)', color: '#facc15', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 500 }}>
            <Clock size={18} /> Đang chờ admin duyệt
          </div>
        )}
        {status === 'rejected' && (
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 500 }}>
            <XCircle size={18} /> Đã bị từ chối
          </div>
        )}
        {!status && (
          <button onClick={handleComplete} disabled={completing} className="gradient-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {completing ? 'Đang xử lý...' : 'Làm nhiệm vụ này'}
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
