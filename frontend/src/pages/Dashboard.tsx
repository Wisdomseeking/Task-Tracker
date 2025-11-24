import  { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import api from "../api/axios";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

export type TaskStatus = "todo" | "in-progress" | "completed";

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus | string;
  priority?: "low" | "medium" | "high" | string;
  dueDate?: string | null;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  useEffect(() => { fetchTasks(); /* eslint-disable-next-line */ }, []);

  const toUiStatus = (s: string | null | undefined) => s ? s.replace("_", "-") : "todo";

  const mapBackendTask = (t: any): Task => ({
    id: t.id,
    title: t.title,
    description: t.description ?? null,
    status: toUiStatus(t.status),
    priority: t.priority ?? "medium",
    dueDate: t.dueDate ?? null,
    createdAt: t.createdAt,
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks");
      const backendTasks = res.data.tasks ?? [];
      setTasks(backendTasks.map(mapBackendTask));
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: CreateTaskInput) => {
    try {
      const res = await api.post("/tasks", data);
      setTasks(prev => [mapBackendTask(res.data), ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Create task error", err);
    }
  };

  const handleUpdateTask = async (data: CreateTaskInput) => {
    if (!editingTask) return;
    try {
      const res = await api.patch(`/tasks/${editingTask.id}`, data);
      const updated = mapBackendTask(res.data);
      setTasks(prev => prev.map(t => (t.id === editingTask.id ? updated : t)));
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Update task error", err);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Delete task error", err);
    }
  };

  const openCreateModal = () => { setEditingTask(null); setIsModalOpen(true); };
  const openEditModal = (task: Task) => { setEditingTask(task); setIsModalOpen(true); };

  const filteredTasks = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div className="app-container">Loading...</div>;

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          <div className="logo">TM</div>
          <div>
            <h1>Task Manager</h1>
            <div className="small">Welcome back, {user?.username || "User"}</div>
          </div>
        </div>

        <div className="header-actions">
          <div className="controls">
            <button className="btn" onClick={openCreateModal}>+ New Task</button>
            <select className="select" value={filter} onChange={e => setFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 12 }}>
            <button className="btn-ghost" onClick={() => { logout(); }}>Logout</button>
          </div>
        </div>
      </header>

      <div className="grid">
        <aside className="sidebar card">
          <div className="user-box">
            <div className="avatar">{(user?.username?.[0] || "U").toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{user?.username || "User"}</div>
              <div className="small">{user?.email || ""}</div>
            </div>
          </div>

          <div className="section">
            <div className="small">Filters</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn-ghost" onClick={() => setFilter("all")}>All</button>
              <button className="btn-ghost" onClick={() => setFilter("todo")}>To Do</button>
              <button className="btn-ghost" onClick={() => setFilter("in-progress")}>In Progress</button>
              <button className="btn-ghost" onClick={() => setFilter("completed")}>Completed</button>
            </div>
          </div>

          <div className="section">
            <div className="small">Stats</div>
            <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
              <div className="stat"><h3>All</h3><p>{tasks.length}</p></div>
              <div className="stat"><h3>Open</h3><p>{tasks.filter(t => t.status === "todo").length}</p></div>
              <div className="stat"><h3>Completed</h3><p>{tasks.filter(t => t.status === "completed").length}</p></div>
            </div>
          </div>
        </aside>

        <main>
          <div className="panel">
            <div className="stats">
              <div className="stat"><h3>Total Tasks</h3><p>{tasks.length}</p></div>
              <div className="stat"><h3>Pending</h3><p>{tasks.filter(t => t.status === "todo").length}</p></div>
              <div className="stat"><h3>Completed</h3><p>{tasks.filter(t => t.status === "completed").length}</p></div>
            </div>

            {filteredTasks.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>No tasks to show — create one 🎉</div>
            ) : (
              <div className="task-grid">
                {filteredTasks.map(t => (
                  <TaskCard key={t.id} task={t} onEdit={openEditModal} onDelete={handleDeleteTask} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <TaskModal task={editingTask} onSave={editingTask ? handleUpdateTask : handleCreateTask} onClose={() => { setIsModalOpen(false); setEditingTask(null); }} />
      )}
    </div>
  );
}
