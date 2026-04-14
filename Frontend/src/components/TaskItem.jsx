import { useState } from 'react';

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const saveEdit = () => {
    if (title.trim() && title !== task.title) onEdit(task._id, title.trim());
    setEditing(false);
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task._id, !task.completed)}
      />

      {editing ? (
        <input
          className="task-edit-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') setEditing(false);
          }}
          autoFocus
        />
      ) : (
        <span className="task-title">{task.title}</span>
      )}

      <span className={`task-badge ${task.completed ? 'done' : 'pending'}`}>
        {task.completed ? 'Done' : 'Pending'}
      </span>

      <div className="task-actions">
        {editing ? (
          <>
            <button className="btn btn-sm btn-success" onClick={saveEdit}>Save</button>
            <button className="btn btn-sm btn-secondary" onClick={() => { setEditing(false); setTitle(task.title); }}>
              Cancel
            </button>
          </>
        ) : (
          <button className="btn btn-sm btn-secondary" onClick={() => setEditing(true)}>✏️</button>
        )}
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(task._id)}>🗑️</button>
      </div>
    </li>
  );
}
