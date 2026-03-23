import { todayISODate } from "../mappers/task.js";

function taskFilterClause(query) {
  let where = "WHERE client_id = ?";
  const params = [query.clientId];

  if (query.status && typeof query.status === "string") {
    where += " AND status = ?";
    params.push(query.status);
  }
  if (query.category && typeof query.category === "string" && query.category.trim()) {
    where += " AND category = ?";
    params.push(query.category.trim());
  }
  if (query.q && typeof query.q === "string" && query.q.trim()) {
    where += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)";
    const like = `%${query.q.trim().toLowerCase()}%`;
    params.push(like, like);
  }

  return { where, params };
}

function orderByClause(sort) {
  if (sort === "due_date_desc") {
    return "ORDER BY due_date DESC, id ASC";
  }
  if (sort === "priority") {
    return "ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, due_date ASC, id ASC";
  }
  return "ORDER BY due_date ASC, id ASC";
}

export function countTasksForClient(db, filterQuery) {
  const { where, params } = taskFilterClause(filterQuery);
  return db.prepare(`SELECT COUNT(*) AS n FROM tasks ${where}`).get(...params).n;
}

export function listTasksPageForClient(db, filterQuery, limit, offset) {
  const { where, params } = taskFilterClause(filterQuery);
  const orderBy = orderByClause(filterQuery.sort);
  const sql = `SELECT * FROM tasks ${where} ${orderBy} LIMIT ? OFFSET ?`;
  return db.prepare(sql).all(...params, limit, offset);
}

export function insertTask(db, row) {
  const result = db
    .prepare(
      `INSERT INTO tasks (client_id, title, description, category, due_date, status, priority)
       VALUES (@client_id, @title, @description, @category, @due_date, @status, @priority)`
    )
    .run(row);
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
}

export function getTaskById(db, id) {
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
}

export function updateTaskStatus(db, taskId, status) {
  db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, taskId);
  return getTaskById(db, taskId);
}

export function getClientTaskSummary(db, clientId) {
  const today = todayISODate();
  const rows = db.prepare("SELECT status, due_date FROM tasks WHERE client_id = ?").all(clientId);
  let total = 0;
  let pending = 0;
  let overdue = 0;
  for (const r of rows) {
    total += 1;
    if (r.status !== "Completed") pending += 1;
    if (r.status !== "Completed" && r.due_date < today) overdue += 1;
  }
  const catRows = db
    .prepare(
      "SELECT DISTINCT category FROM tasks WHERE client_id = ? ORDER BY category COLLATE NOCASE ASC"
    )
    .all(clientId);
  const categories = catRows.map((r) => r.category);
  return {
    total,
    pending,
    overdue,
    completed: total - pending,
    categories,
  };
}
