export function countClients(db) {
  return db.prepare("SELECT COUNT(*) AS n FROM clients").get().n;
}

export function listClientsPage(db, limit, offset) {
  return db
    .prepare("SELECT * FROM clients ORDER BY company_name ASC LIMIT ? OFFSET ?")
    .all(limit, offset);
}

export function clientExists(db, id) {
  return Boolean(db.prepare("SELECT 1 AS ok FROM clients WHERE id = ?").get(id));
}
