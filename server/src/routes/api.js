import { Router } from "express";
import { getDb } from "../db.js";
import { validateCreateTask, validateUpdateStatus } from "../validation.js";
import { parsePagination, buildPageMeta } from "../pagination.js";
import { formatTaskRow } from "../mappers/task.js";
import * as clientsRepo from "../repositories/clients.repository.js";
import * as tasksRepo from "../repositories/tasks.repository.js";

const router = Router();

function parseClientId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

function parseTaskId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

router.get("/clients", (req, res, next) => {
  try {
    const db = getDb();
    const { page, pageSize, offset } = parsePagination(req.query);
    const total = clientsRepo.countClients(db);
    const items = clientsRepo.listClientsPage(db, pageSize, offset);
    res.json({
      items,
      ...buildPageMeta(total, page, pageSize),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/clients/:clientId/tasks", (req, res, next) => {
  try {
    const clientId = parseClientId(req.params.clientId);
    if (clientId == null) {
      return res.status(400).json({ error: "Invalid client id" });
    }
    const db = getDb();
    if (!clientsRepo.clientExists(db, clientId)) {
      return res.status(404).json({ error: "Client not found" });
    }
    const { page, pageSize, offset } = parsePagination(req.query);
    const filterQuery = {
      clientId,
      status: req.query.status,
      category: req.query.category,
      q: req.query.q,
      sort: req.query.sort,
    };
    const total = tasksRepo.countTasksForClient(db, filterQuery);
    const rows = tasksRepo.listTasksPageForClient(db, filterQuery, pageSize, offset);
    res.json({
      items: rows.map(formatTaskRow),
      ...buildPageMeta(total, page, pageSize),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/tasks", (req, res, next) => {
  try {
    const { errors, value } = validateCreateTask(req.body || {});
    if (errors.length) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    const db = getDb();
    if (!clientsRepo.clientExists(db, value.client_id)) {
      return res.status(404).json({ error: "Client not found" });
    }
    const task = tasksRepo.insertTask(db, value);
    res.status(201).json(formatTaskRow(task));
  } catch (err) {
    next(err);
  }
});

router.patch("/tasks/:taskId/status", (req, res, next) => {
  try {
    const taskId = parseTaskId(req.params.taskId);
    if (taskId == null) {
      return res.status(400).json({ error: "Invalid task id" });
    }
    const { errors, value } = validateUpdateStatus(req.body || {});
    if (errors.length) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    const db = getDb();
    const existing = tasksRepo.getTaskById(db, taskId);
    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }
    const task = tasksRepo.updateTaskStatus(db, taskId, value.status);
    res.json(formatTaskRow(task));
  } catch (err) {
    next(err);
  }
});

router.get("/clients/:clientId/summary", (req, res, next) => {
  try {
    const clientId = parseClientId(req.params.clientId);
    if (clientId == null) {
      return res.status(400).json({ error: "Invalid client id" });
    }
    const db = getDb();
    if (!clientsRepo.clientExists(db, clientId)) {
      return res.status(404).json({ error: "Client not found" });
    }
    const summary = tasksRepo.getClientTaskSummary(db, clientId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

export default router;
