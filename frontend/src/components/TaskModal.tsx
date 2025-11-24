import React, { useEffect, useState } from "react";
import { Task, CreateTaskInput } from "../pages/Dashboard";

interface Props {
  task: Task | null;
  onSave: (payload: CreateTaskInput) => void;
  onClose: () => void;
}

export default function TaskModal({ task, onSave, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "completed">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");

  const toUiStatus = (s?: string | null) => (s ? s.replace("_", "-") as any : "todo");
  const toBackendStatus = (s: string) => s.replace("-", "_");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description ?? "");
      setStatus(toUiStatus(task.status ?? "todo"));
      setPriority((task.priority ?? "medium") as any);
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    } else {
      setTitle(""); setDescription(""); setStatus("todo"); setPriority("medium"); setDueDate("");
    }
  }, [task]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      status: toBackendStatus(status),
      priority,
      dueDate: dueDate || undefined,
    };
    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{task ? "Edit Task" : "Create Task"}</h2>

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-row">
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="form-row">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-row">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-row">
              <label>Due date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button className="btn" type="submit">{task ? "Update" : "Create"}</button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
