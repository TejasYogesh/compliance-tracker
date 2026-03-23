export function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export function formatTaskRow(row) {
  const overdue = row.status !== "Completed" && row.due_date < todayISODate();
  return { ...row, overdue };
}
