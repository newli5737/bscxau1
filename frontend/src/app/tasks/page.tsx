'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { taskAPI } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import { ClipboardList, Globe, Link2, Bot, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Task { id: number; title: string; description: string; reward: number; taskType: string; }
interface TaskCompletion { id: number; taskId: number; status: string; task: Task; }

export default function TasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<TaskCompletion[]>([]);
  const [completing, setCompleting] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      taskAPI.getAll().then(setTasks).catch(() => {});
      taskAPI.getMy().then(setMyTasks).catch(() => {});
    }
  }, [user]);

  const handleComplete = async (taskId: number) => {
    setCompleting(taskId);
    setMsg('');
    try {
      await taskAPI.complete(taskId);
      setMsg('Đã gửi yêu cầu! Chờ admin duyệt.');
      taskAPI.getMy().then(setMyTasks);
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setCompleting(null);
    }
  };

  const getTaskStatus = (taskId: number) => myTasks.find(t => t.taskId === taskId)?.status;

  const statusConfig: Record<string, { text: string; color: string; Icon: any }> = {
    pending: { text: 'Chờ duyệt', color: '#facc15', Icon: Clock },
    approved: { text: 'Đã duyệt', color: '#4ade80', Icon: CheckCircle },
    rejected: { text: 'Từ chối', color: '#f87171', Icon: XCircle },
  };

  const taskTypeIcon: Record<string, any> = {
    web_view: Globe,
    click_link: Link2,
    ai_trading: Bot,
  };

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="neon-text">Đang tải...</div></div>;

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }} className="animate-in">
        <ClipboardList size={22} color="#ff4757" />
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Nhiệm vụ</h1>
      </div>

      {msg && (
        <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '12px', fontSize: '13px', background: msg.includes('gửi') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: msg.includes('gửi') ? '#86efac' : '#fca5a5', border: '1px solid rgba(34,197,94,0.3)' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}>
        {tasks.map((task, i) => {
          const status = getTaskStatus(task.id);
          const TaskIcon = taskTypeIcon[task.taskType] || ClipboardList;
          return (
            <div key={task.id} className="glass-card animate-in" style={{ padding: '16px', animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TaskIcon size={18} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{task.title}</h3>
                  {task.description && <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{task.description}</p>}
                  <p className="neon-text" style={{ fontSize: '14px', fontWeight: 700 }}>+{task.reward.toLocaleString('vi-VN')} đ</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {status ? (() => {
                    const cfg = statusConfig[status] || statusConfig.pending;
                    const StatusIcon = cfg.Icon;
                    return (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: cfg.color, fontSize: '12px', fontWeight: 500 }}>
                        <StatusIcon size={14} />
                        {cfg.text}
                      </span>
                    );
                  })() : (
                    <button onClick={() => handleComplete(task.id)} disabled={completing === task.id}
                      style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer' }}>
                      {completing === task.id ? '...' : 'Làm'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
            <ClipboardList size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p>Chưa có nhiệm vụ nào</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
