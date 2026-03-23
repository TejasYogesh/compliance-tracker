import { getDb } from "./db.js";

const db = getDb();

const clients = [
  { company_name: "Acme Holdings Ltd", country: "United Kingdom", entity_type: "Private Limited" },
  { company_name: "Blue River GmbH", country: "Germany", entity_type: "GmbH" },
  { company_name: "Northwind SAS", country: "France", entity_type: "SAS" },
  { company_name: "Summit Analytics Inc", country: "United States", entity_type: "C-Corp" },
  { company_name: "Veridian Coöperatie", country: "Netherlands", entity_type: "Cooperative" },
];

db.exec("DELETE FROM tasks; DELETE FROM clients;");

const insertClient = db.prepare(
  "INSERT INTO clients (company_name, country, entity_type) VALUES (?, ?, ?)"
);
const clientIds = [];
for (const c of clients) {
  const r = insertClient.run(c.company_name, c.country, c.entity_type);
  clientIds.push(Number(r.lastInsertRowid));
}

const insertTask = db.prepare(
  `INSERT INTO tasks (client_id, title, description, category, due_date, status, priority)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);

const seedTasks = [
  {
    clientIndex: 0,
    title: "Annual accounts filing",
    description: "File with Companies House before deadline.",
    category: "Filings",
    due_date: "2025-04-15",
    status: "Pending",
    priority: "High",
  },
  {
    clientIndex: 0,
    title: "VAT return Q1",
    description: "Prepare and submit VAT return.",
    category: "Tax",
    due_date: "2024-12-01",
    status: "Pending",
    priority: "High",
  },
  {
    clientIndex: 0,
    title: "Payroll reconciliation",
    description: "March payroll vs. ledger.",
    category: "Payroll",
    due_date: "2026-06-30",
    status: "In Progress",
    priority: "Medium",
  },
  {
    clientIndex: 0,
    title: "GDPR records of processing",
    description: "Refresh ROPA documentation.",
    category: "Governance",
    due_date: "2025-01-20",
    status: "Pending",
    priority: "Low",
  },
  {
    clientIndex: 1,
    title: "Trade register update",
    description: "Update beneficial ownership.",
    category: "Filings",
    due_date: "2025-02-28",
    status: "Completed",
    priority: "Low",
  },
  {
    clientIndex: 1,
    title: "Umsatzsteuer-Voranmeldung",
    description: "Monthly VAT prepayment.",
    category: "Tax",
    due_date: "2024-11-10",
    status: "Pending",
    priority: "Medium",
  },
  {
    clientIndex: 1,
    title: "Works council payroll summary",
    description: "Quarterly report for Betriebsrat.",
    category: "Payroll",
    due_date: "2026-04-10",
    status: "Pending",
    priority: "Medium",
  },
  {
    clientIndex: 2,
    title: "CFE declaration",
    description: "Corporate income tax instalment.",
    category: "Tax",
    due_date: "2026-03-31",
    status: "Pending",
    priority: "Low",
  },
  {
    clientIndex: 2,
    title: "URSSAF déclaration",
    description: "Social contributions summary.",
    category: "Filings",
    due_date: "2024-09-30",
    status: "In Progress",
    priority: "High",
  },
  {
    clientIndex: 3,
    title: "Form 1120 extension",
    description: "File extension if needed; confirm with partner.",
    category: "Tax",
    due_date: "2026-04-15",
    status: "Pending",
    priority: "High",
  },
  {
    clientIndex: 3,
    title: "Delaware franchise tax",
    description: "Pay annual franchise tax for DE entity.",
    category: "Filings",
    due_date: "2025-03-01",
    status: "Pending",
    priority: "Medium",
  },
  {
    clientIndex: 3,
    title: "401(k) compliance test",
    description: "ADP/ACP testing for plan year.",
    category: "Payroll",
    due_date: "2026-02-28",
    status: "Completed",
    priority: "Low",
  },
  {
    clientIndex: 4,
    title: "KvK annual statement",
    description: "Submit annual figures to Chamber of Commerce.",
    category: "Filings",
    due_date: "2026-05-31",
    status: "Pending",
    priority: "Medium",
  },
  {
    clientIndex: 4,
    title: "VAT OSS quarterly",
    description: "One Stop Shop EU VAT return.",
    category: "Tax",
    due_date: "2024-10-20",
    status: "Pending",
    priority: "High",
  },
];

for (const t of seedTasks) {
  insertTask.run(
    clientIds[t.clientIndex],
    t.title,
    t.description,
    t.category,
    t.due_date,
    t.status,
    t.priority
  );
}

console.log(`Seeded ${clientIds.length} clients and ${seedTasks.length} tasks.`);
