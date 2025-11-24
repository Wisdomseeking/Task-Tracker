
import { Task } from "../pages/Dashboard";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const displayStatusKey = (task.status ?? "todo").toString().replace("-", "_");
  const displayStatusLabel = (task.status ?? "todo").toString().replace("_", " ");

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : null;

  return (
    <article className="task-card" role="article" aria-labelledby={`task-${task.id}`}>
      <div className="task-header">
        <div>
          <h3 id={`task-${task.id}`}>{task.title}</h3>
          <div className="task-meta" style={{ marginTop: 8 }}>
            <span className={`chip ${displayStatusKey}`}>{displayStatusLabel}</span>
            <span style={{ width: 8 }} />
            <span className={`badge ${task.priority ?? "medium"}`}>{task.priority ?? "medium"}</span>
          </div>
        </div>
        <div className="small">{formatDate(task.dueDate) ?? ""}</div>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-actions">
        <button className="action-btn" onClick={() => onEdit(task)}>Edit</button>
        <button className="action-btn danger" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </article>
  );
}
