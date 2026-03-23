import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchClientsPage,
  fetchClientSummary,
  fetchTasksPage,
  createTask,
  patchTaskStatus,
} from "./api/endpoints.js";
import {
  CLIENT_PAGE_SIZE_OPTIONS,
  TASK_PAGE_SIZE_OPTIONS,
  TASK_SORT_OPTIONS,
  TASK_STATUS_FILTERS,
} from "./constants/ui.js";
import { priorityBadgeClass } from "./utils/taskUi.js";
import PaginationBar from "./components/PaginationBar.jsx";
import AddTaskModal from "./components/AddTaskModal.jsx";

function createEmptyTaskForm() {
  return {
    title: "",
    description: "",
    category: "",
    due_date: "",
    status: "Pending",
    priority: "Medium",
  };
}

const emptyTaskMeta = (pageSize) => ({
  total: 0,
  page: 1,
  pageSize,
  totalPages: 0,
});

export default function App() {
  const [clients, setClients] = useState([]);
  const [clientMeta, setClientMeta] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(10);

  const [selectedId, setSelectedId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskMeta, setTaskMeta] = useState(emptyTaskMeta(10));
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize, setTaskPageSize] = useState(10);

  const [summary, setSummary] = useState(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("due_date_asc");

  const [form, setForm] = useState(createEmptyTaskForm);
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const loadClients = useCallback(async () => {
    setLoadingClients(true);
    setError(null);
    try {
      const data = await fetchClientsPage(clientPage, clientPageSize);
      setClients(data.items);
      setClientMeta({
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      });
      setSelectedId((id) => {
        if (id && data.items.some((c) => c.id === id)) return id;
        return data.items[0]?.id ?? null;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingClients(false);
    }
  }, [clientPage, clientPageSize]);

  const loadTasksForClient = useCallback(
    async (clientId, opts) => {
      if (!clientId) {
        setTasks([]);
        setSummary(null);
        setTaskMeta(emptyTaskMeta(taskPageSize));
        return;
      }
      const page = opts?.page ?? taskPage;
      const size = opts?.pageSize ?? taskPageSize;
      setLoadingTasks(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterCategory.trim()) params.set("category", filterCategory.trim());
      if (search.trim()) params.set("q", search.trim());
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("pageSize", String(size));
      try {
        const [taskData, sum] = await Promise.all([
          fetchTasksPage(clientId, params),
          fetchClientSummary(clientId),
        ]);
        setTasks(taskData.items);
        setTaskMeta({
          total: taskData.total,
          page: taskData.page,
          pageSize: taskData.pageSize,
          totalPages: taskData.totalPages,
        });
        setSummary(sum);
        if (opts?.page != null) setTaskPage(opts.page);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingTasks(false);
      }
    },
    [filterStatus, filterCategory, search, sort, taskPage, taskPageSize]
  );

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    setTaskPage(1);
  }, [selectedId]);

  useEffect(() => {
    loadTasksForClient(selectedId);
  }, [selectedId, loadTasksForClient]);

  const categories = useMemo(() => {
    const list = summary?.categories;
    return Array.isArray(list) ? list : [];
  }, [summary]);

  const selectedClient = clients.find((c) => c.id === selectedId);

  const openAddModal = useCallback(() => {
    setForm(createEmptyTaskForm());
    setAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setAddModalOpen(false);
    setForm(createEmptyTaskForm());
  }, []);

  useEffect(() => {
    if (!addModalOpen) return;
    function onKey(e) {
      if (e.key === "Escape") closeAddModal();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [addModalOpen, closeAddModal]);

  async function handleStatusChange(taskId, status) {
    setError(null);
    try {
      const updated = await patchTaskStatus(taskId, status);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedId) {
        const sum = await fetchClientSummary(selectedId);
        setSummary(sum);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddTask(e) {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      await createTask({
        client_id: selectedId,
        title: form.title,
        description: form.description,
        category: form.category,
        due_date: form.due_date,
        status: form.status,
        priority: form.priority,
      });
      setForm(createEmptyTaskForm());
      setAddModalOpen(false);
      setTaskPage(1);
      await loadTasksForClient(selectedId, { page: 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__logo" aria-hidden="true">
            CT
          </div>
          <h1>
            Compliance <span className="title-accent">Tracker</span>
          </h1>
        </div>
        <p>Clients, tasks, and overdue work at a glance.</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <div className="layout">
        <aside className="panel panel--clients">
          <h2>Clients</h2>
          {loadingClients ? (
            <p className="loading">Loading clients…</p>
          ) : clients.length === 0 ? (
            <p className="empty-state">No clients yet. Run the seed script.</p>
          ) : (
            <ul className="client-list">
              {clients.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`client-item ${c.id === selectedId ? "active" : ""}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <div className="client-name">{c.company_name}</div>
                    <div className="client-meta">
                      {c.country} · {c.entity_type}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loadingClients && clients.length > 0 && (
            <div className="pagination-stack">
              <PaginationBar
                page={clientMeta.page}
                totalPages={clientMeta.totalPages}
                total={clientMeta.total}
                pageSize={clientMeta.pageSize}
                onPageChange={setClientPage}
                idPrefix="clients"
                noun="clients"
              />
              <div className="field field--inline">
                <label htmlFor="client-page-size">Per page</label>
                <select
                  id="client-page-size"
                  value={clientPageSize}
                  onChange={(e) => {
                    setClientPageSize(Number(e.target.value));
                    setClientPage(1);
                  }}
                >
                  {CLIENT_PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </aside>

        <main className="panel panel--main">
          {!selectedClient ? (
            <p className="empty-state">Select a client to view tasks.</p>
          ) : (
            <>
              <h2>{selectedClient.company_name}</h2>

              {summary && (
                <div className="summary-row" aria-label="Task summary">
                  <div className="stat stat--total">
                    <strong>{summary.total}</strong>
                    Total
                  </div>
                  <div className="stat stat--open">
                    <strong>{summary.pending}</strong>
                    Open
                  </div>
                  <div className="stat stat--overdue">
                    <strong>{summary.overdue}</strong>
                    Overdue
                  </div>
                  <div className="stat stat--done">
                    <strong>{summary.completed}</strong>
                    Done
                  </div>
                </div>
              )}

              <div className="toolbar toolbar--with-action">
                <div className="toolbar__filters">
                  <div className="field">
                    <label htmlFor="f-status">Status</label>
                    <select
                      id="f-status"
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setTaskPage(1);
                      }}
                    >
                      {TASK_STATUS_FILTERS.map((s) => (
                        <option key={s || "all"} value={s}>
                          {s || "All"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="f-cat">Category</label>
                    <input
                      id="f-cat"
                      list="category-options"
                      value={filterCategory}
                      onChange={(e) => {
                        setFilterCategory(e.target.value);
                        setTaskPage(1);
                      }}
                      placeholder="e.g. Tax"
                    />
                    <datalist id="category-options">
                      {categories.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div className="field">
                    <label htmlFor="f-search">Search</label>
                    <input
                      id="f-search"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setTaskPage(1);
                      }}
                      placeholder="Title or description"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-sort">Sort</label>
                    <select
                      id="f-sort"
                      value={sort}
                      onChange={(e) => {
                        setSort(e.target.value);
                        setTaskPage(1);
                      }}
                    >
                      {TASK_SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-add-task"
                  onClick={openAddModal}
                  aria-haspopup="dialog"
                >
                  <span className="btn-add-task__icon" aria-hidden="true">
                    +
                  </span>
                  New task
                </button>
              </div>

              {loadingTasks ? (
                <p className="loading">Loading tasks…</p>
              ) : tasks.length === 0 ? (
                <p className="empty-state">No tasks match your filters.</p>
              ) : (
                <ul className="task-list">
                  {tasks.map((t) => (
                    <li key={t.id} className={`task-card ${t.overdue ? "overdue" : ""}`}>
                      <div className="task-head">
                        <h3 className="task-title">{t.title}</h3>
                        <div className="task-badges">
                          <span className="badge category">{t.category}</span>
                          <span className={`badge ${priorityBadgeClass(t.priority)}`}>
                            {t.priority}
                          </span>
                        </div>
                      </div>
                      {t.description ? <p className="task-desc">{t.description}</p> : null}
                      <div className="task-foot">
                        <div className={`due-line ${t.overdue ? "overdue-label" : ""}`}>
                          Due {t.due_date}
                          {t.overdue ? " · Overdue (pending)" : ""}
                        </div>
                        <label>
                          <span className="visually-hidden">Status</span>
                          <select
                            className="status-select"
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                            aria-label={`Status for ${t.title}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {selectedClient && !loadingTasks && (
                <div className="pagination-stack pagination-stack--tasks">
                  <PaginationBar
                    page={taskMeta.page}
                    totalPages={taskMeta.totalPages}
                    total={taskMeta.total}
                    pageSize={taskMeta.pageSize}
                    onPageChange={setTaskPage}
                    idPrefix="tasks"
                    noun="tasks"
                  />
                  <div className="field field--inline">
                    <label htmlFor="task-page-size">Tasks per page</label>
                    <select
                      id="task-page-size"
                      value={taskPageSize}
                      onChange={(e) => {
                        setTaskPageSize(Number(e.target.value));
                        setTaskPage(1);
                      }}
                    >
                      {TASK_PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <AddTaskModal
        open={Boolean(addModalOpen && selectedClient)}
        clientName={selectedClient?.company_name ?? ""}
        form={form}
        setForm={setForm}
        saving={saving}
        onClose={closeAddModal}
        onSubmit={handleAddTask}
      />
    </div>
  );
}
