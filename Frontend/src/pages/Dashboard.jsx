import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TaskItem from '../components/TaskItem';
import Footer from '../components/Footer';

const PAGE_SIZE = 5;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks]       = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [error, setError]       = useState('');

  useEffect(() => { fetchTasks(); }, []);

  // Reset to page 1 whenever filter or search changes
  useEffect(() => { setPage(1); }, [filter, search]);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch {
      setError('Failed to load tasks');
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const { data } = await api.post('/tasks', { title: newTitle.trim() });
      setTasks(prev => [data, ...prev]);
      setNewTitle('');
    } catch {
      setError('Failed to add task');
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, { completed });
      setTasks(prev => prev.map(t => t._id === id ? data : t));
    } catch { setError('Failed to update task'); }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch { setError('Failed to delete task'); }
  };

  const editTask = async (id, title) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, { title });
      setTasks(prev => prev.map(t => t._id === id ? data : t));
    } catch { setError('Failed to edit task'); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Derived data ──────────────────────────────────
  const filtered = useMemo(() => {
    return tasks
      .filter(t => {
        if (filter === 'completed') return t.completed;
        if (filter === 'pending')   return !t.completed;
        return true;
      })
      .filter(t => t.title.toLowerCase().includes(search.toLowerCase().trim()));
  }, [tasks, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCount     = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount   = tasks.filter(t => !t.completed).length;
  const avatarLetter   = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="dashboard-page">

      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-icon">✅</span>
            <span className="brand-name">TaskFlow</span>
          </div>
          <div className="header-user">
            <div className="user-avatar">{avatarLetter}</div>
            <span className="user-name">{user?.name}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="dashboard-main">
        {error && <p className="error">{error}</p>}

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon total">📋</div>
            <div className="stat-info">
              <div className="stat-num">{totalCount}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-info">
              <div className="stat-num">{pendingCount}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon done">✅</div>
            <div className="stat-info">
              <div className="stat-num">{completedCount}</div>
              <div className="stat-label">Done</div>
            </div>
          </div>
        </div>

        {/* Add task */}
        <div className="add-task-card">
          <h3>New Task</h3>
          <form className="task-input-row" onSubmit={addTask}>
            <input
              type="text"
              placeholder="What do you need to do?"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <button className="btn" type="submit">+ Add Task</button>
          </form>
        </div>

        {/* Tasks card */}
        <div className="tasks-card">
          <div className="tasks-card-header">
            <h3>
              {filter === 'all' ? 'All Tasks' : filter === 'pending' ? 'Pending Tasks' : 'Completed Tasks'}
              <span className="task-count-badge">({filtered.length})</span>
            </h3>
            <div className="filter-tabs">
              {['all', 'pending', 'completed'].map(f => (
                <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
            )}
          </div>

          {/* List */}
          {paginated.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{search ? '🔎' : filter === 'completed' ? '🎉' : '📭'}</div>
              <p>
                {search
                  ? `No tasks match "${search}"`
                  : filter === 'completed' ? 'No completed tasks yet.'
                  : filter === 'pending'   ? 'No pending tasks. Great job!'
                  : 'No tasks yet. Add one above!'}
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {paginated.map(task => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onEdit={editTask}
                />
              ))}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >‹ Prev</button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    className={`page-num ${page === n ? 'active' : ''}`}
                    onClick={() => setPage(n)}
                  >{n}</button>
                ))}
              </div>

              <button
                className="page-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
              >Next ›</button>
            </div>
          )}

          {/* Page info */}
          {filtered.length > 0 && (
            <p className="page-info">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} tasks
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
