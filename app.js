import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import employeesSeed from "#db/employees";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "data", "employees.json");

let store = [...employeesSeed];

(async () => {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      store = parsed;
    }
  } catch {}
})();

async function persist() {
  const dir = path.dirname(DATA_PATH);
  try { await fs.mkdir(dir, { recursive: true }); } catch {}
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2));
}

app.get("/", (req, res) => {
  res.send("Hello employees!");
});

app.get("/employees", (req, res) => {
  res.json(store);
});

app.get("/employees/random", (req, res) => {
  const randomIndex = Math.floor(Math.random() * store.length);
  res.json(store[randomIndex]);
});

app.get("/employees/:id", (req, res) => {
  const id = Number(req.params.id);
  const employee = store.find(e => e.id === id);
  if (!employee) return res.status(404).send("Employee not found");
  res.json(employee);
});

app.post("/employees", async (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).send("Name is required");
  }
  const maxId = store.reduce((m, e) => Math.max(m, e.id), 0);
  const newEmployee = { id: maxId + 1, name: name.trim() };
  store.push(newEmployee);
  await persist();
  res.status(201).json(newEmployee);
});

export default app;
