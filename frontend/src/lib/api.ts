const API_URL = '/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Lỗi kết nối' }));
    throw new Error(error.message || 'Đã xảy ra lỗi');
  }

  return res.json();
}

// Auth
export const authAPI = {
  getCaptcha: () => fetchAPI('/auth/captcha'),
  register: (data: any) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => fetchAPI('/auth/profile'),
  updateBank: (data: any) => fetchAPI('/auth/bank', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Investments
export const investmentAPI = {
  getProducts: () => fetchAPI('/investments/products'),
  buy: (productId: number) => fetchAPI(`/investments/buy/${productId}`, { method: 'POST' }),
  getMy: () => fetchAPI('/investments/my'),
};

// Tasks
export const taskAPI = {
  getAll: () => fetchAPI('/tasks'),
  getById: (id: number) => fetchAPI(`/tasks/${id}`),
  complete: (taskId: number) => fetchAPI(`/tasks/${taskId}/complete`, { method: 'POST' }),
  getMy: () => fetchAPI('/tasks/my'),
};

// Wallet
export const walletAPI = {
  getBalance: () => fetchAPI('/wallet/balance'),
  createDeposit: (amount: number, productId?: number) => fetchAPI('/wallet/deposit', { method: 'POST', body: JSON.stringify({ amount, productId }) }),
  getDepositOrder: (id: number) => fetchAPI(`/wallet/deposit-order/${id}`),
  withdraw: (amount: number) => fetchAPI('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount }) }),
  getDeposits: () => fetchAPI('/wallet/deposits'),
  getWithdrawals: () => fetchAPI('/wallet/withdrawals'),
};

// Referral
export const referralAPI = {
  getTeam: () => fetchAPI('/referral/team'),
};

// Admin
export const adminAPI = {
  getUsers: (page = 1) => fetchAPI(`/admin/users?page=${page}`),
  getReferralTree: (userId: number) => fetchAPI(`/admin/referral-tree/${userId}`),
  getProducts: () => fetchAPI('/admin/products'),
  createProduct: (data: any) => fetchAPI('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => fetchAPI(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => fetchAPI(`/admin/products/${id}`, { method: 'DELETE' }),
  getTasks: () => fetchAPI('/admin/tasks'),
  createTask: (data: any) => fetchAPI('/admin/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: number, data: any) => fetchAPI(`/admin/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getPendingTasks: () => fetchAPI('/admin/task-completions/pending'),
  approveTask: (id: number) => fetchAPI(`/admin/task-completions/${id}/approve`, { method: 'PATCH' }),
  rejectTask: (id: number) => fetchAPI(`/admin/task-completions/${id}/reject`, { method: 'PATCH' }),
  getPendingDeposits: () => fetchAPI('/admin/deposits/pending'),
  approveDeposit: (id: number) => fetchAPI(`/admin/deposits/${id}/approve`, { method: 'PATCH' }),
  rejectDeposit: (id: number, note?: string) => fetchAPI(`/admin/deposits/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ note: note || 'Chưa đủ điều kiện' }) }),
  getPendingWithdrawals: () => fetchAPI('/admin/withdrawals/pending'),
  approveWithdrawal: (id: number) => fetchAPI(`/admin/withdrawals/${id}/approve`, { method: 'PATCH' }),
  rejectWithdrawal: (id: number, note?: string) => fetchAPI(`/admin/withdrawals/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ note: note || 'Chưa đủ điều kiện' }) }),
  getStats: () => fetchAPI('/admin/stats'),
  updateReferralCode: (userId: number, referralCode: string) => fetchAPI(`/admin/users/${userId}/referral-code`, { method: 'PATCH', body: JSON.stringify({ referralCode }) }),
  getBankAccounts: () => fetchAPI('/admin/bank-accounts'),
  createBankAccount: (data: any) => fetchAPI('/admin/bank-accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateBankAccount: (id: number, data: any) => fetchAPI(`/admin/bank-accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBankAccount: (id: number) => fetchAPI(`/admin/bank-accounts/${id}`, { method: 'DELETE' }),
  adjustBalance: (userId: number, amount: number) => fetchAPI(`/admin/users/${userId}/balance`, { method: 'PATCH', body: JSON.stringify({ amount }) }),
  getInvestments: () => fetchAPI('/admin/investments'),
  getSupportUrl: () => fetchAPI('/admin/settings/support'),
  setSupportUrl: (url: string) => fetchAPI('/admin/settings/support', { method: 'PATCH', body: JSON.stringify({ url }) }),
};
