import { requestJson } from "./http.js";

export function fetchClientsPage(page, pageSize) {
  const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return requestJson(`/api/clients?${q}`);
}

export function fetchTasksPage(clientId, params) {
  return requestJson(`/api/clients/${clientId}/tasks?${params}`);
}

export function fetchClientSummary(clientId) {
  return requestJson(`/api/clients/${clientId}/summary`);
}

export function createTask(body) {
  return requestJson("/api/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function patchTaskStatus(taskId, status) {
  return requestJson(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
