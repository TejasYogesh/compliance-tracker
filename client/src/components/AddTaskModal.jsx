export default function AddTaskModal({
  open,
  clientName,
  form,
  setForm,
  saving,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <h2 id="add-task-modal-title" className="modal__title">
              New task
            </h2>
            <p className="modal__subtitle">
              For <strong>{clientName}</strong> — add a compliance task to track.
            </p>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="modal__body" onSubmit={onSubmit}>
          <div className="modal__section">
            <span className="modal__section-label">Details</span>
            <div className="form-grid form-grid--modal">
              <div className="field field--full">
                <label htmlFor="new-title">Title</label>
                <input
                  id="new-title"
                  required
                  autoFocus
                  placeholder="e.g. Q2 VAT filing"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="field field--full">
                <label htmlFor="new-desc">Description</label>
                <textarea
                  id="new-desc"
                  rows={4}
                  placeholder="Scope, deadlines, filing references, owner notes…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="modal__section">
            <span className="modal__section-label">Scheduling &amp; priority</span>
            <div className="form-grid form-grid--modal">
              <div className="field">
                <label htmlFor="new-cat">Category</label>
                <input
                  id="new-cat"
                  required
                  placeholder="Tax, Filings, Payroll…"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="new-due">Due date</label>
                <input
                  id="new-due"
                  type="date"
                  required
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="new-status">Status</label>
                <select
                  id="new-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="new-pri">Priority</label>
                <select
                  id="new-pri"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
