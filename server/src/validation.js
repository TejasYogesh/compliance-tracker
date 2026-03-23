const STATUSES = ["Pending", "In Progress", "Completed"];
const PRIORITIES = ["Low", "Medium", "High"];

export function validateCreateTask(body) {
  const errors = [];
  const client_id = Number(body.client_id);
  if (!Number.isInteger(client_id) || client_id < 1) {
    errors.push({ field: "client_id", message: "client_id must be a positive integer" });
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 500) {
    errors.push({
      field: "title",
      message: "title is required and must be at most 500 characters",
    });
  }
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (description.length > 5000) {
    errors.push({ field: "description", message: "description must be at most 5000 characters" });
  }
  const category = typeof body.category === "string" ? body.category.trim() : "";
  if (!category || category.length > 100) {
    errors.push({
      field: "category",
      message: "category is required and must be at most 100 characters",
    });
  }
  const due_date = typeof body.due_date === "string" ? body.due_date.trim() : "";
  if (!due_date || !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    errors.push({ field: "due_date", message: "due_date must be YYYY-MM-DD" });
  } else {
    const d = new Date(due_date + "T12:00:00Z");
    if (Number.isNaN(d.getTime())) {
      errors.push({ field: "due_date", message: "due_date is not a valid date" });
    }
  }
  const status = typeof body.status === "string" ? body.status.trim() : "Pending";
  if (!STATUSES.includes(status)) {
    errors.push({
      field: "status",
      message: `status must be one of: ${STATUSES.join(", ")}`,
    });
  }
  const priority = typeof body.priority === "string" ? body.priority.trim() : "Medium";
  if (!PRIORITIES.includes(priority)) {
    errors.push({
      field: "priority",
      message: `priority must be one of: ${PRIORITIES.join(", ")}`,
    });
  }
  return { errors, value: { client_id, title, description, category, due_date, status, priority } };
}

export function validateUpdateStatus(body) {
  const errors = [];
  const status = typeof body.status === "string" ? body.status.trim() : "";
  if (!STATUSES.includes(status)) {
    errors.push({
      field: "status",
      message: `status must be one of: ${STATUSES.join(", ")}`,
    });
  }
  return { errors, value: { status } };
}

export { STATUSES, PRIORITIES };
