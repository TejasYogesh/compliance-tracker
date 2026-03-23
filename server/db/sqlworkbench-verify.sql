-- Compliance Tracker — run these in SQL Workbench/J against server/data/compliance.db
-- (Use absolute path in your JDBC URL; see README.)

-- 1) All clients (matches GET /api/clients)
SELECT id, company_name, country, entity_type
FROM clients
ORDER BY company_name;

-- 2) All tasks with client name (matches task list context)
SELECT
  t.id,
  t.client_id,
  c.company_name,
  t.title,
  t.category,
  t.due_date,
  t.status,
  t.priority
FROM tasks t
JOIN clients c ON c.id = t.client_id
ORDER BY t.client_id, t.due_date, t.id;

-- 3) Overdue pending-style tasks (matches app: not Completed, due_date < today UTC)
--    SQLite: date('now') is UTC for this comparison when due_date is YYYY-MM-DD.
SELECT
  t.id,
  c.company_name,
  t.title,
  t.due_date,
  t.status
FROM tasks t
JOIN clients c ON c.id = t.client_id
WHERE t.status != 'Completed'
  AND t.due_date < date('now')
ORDER BY t.due_date;

-- 4) Summary per client (same idea as GET /api/clients/:id/summary)
SELECT
  c.id AS client_id,
  c.company_name,
  COUNT(t.id) AS total,
  SUM(CASE WHEN t.status != 'Completed' THEN 1 ELSE 0 END) AS pending,
  SUM(
    CASE
      WHEN t.status != 'Completed' AND t.due_date < date('now') THEN 1
      ELSE 0
    END
  ) AS overdue,
  SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed
FROM clients c
LEFT JOIN tasks t ON t.client_id = c.id
GROUP BY c.id, c.company_name
ORDER BY c.company_name;

-- 5) Optional: filter like the UI (edit :client_id)
-- SELECT * FROM tasks WHERE client_id = 1 ORDER BY due_date;
