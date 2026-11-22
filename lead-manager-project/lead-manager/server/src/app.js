import express from 'express';
import cors from 'cors';
import { validateLead, STATUSES } from './validation.js';

export function createApp(db) {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '20kb' }));
  const getAll = db.prepare('SELECT * FROM leads ORDER BY created_at DESC, id DESC');
  const getOne = db.prepare('SELECT * FROM leads WHERE id = ?');
  const insert = db.prepare(`INSERT INTO leads (name,email,phone,company,source,status) VALUES (@name,@email,@phone,@company,@source,@status)`);
  const update = db.prepare(`UPDATE leads SET name=@name,email=@email,phone=@phone,company=@company,source=@source,status=@status,updated_at=CURRENT_TIMESTAMP WHERE id=@id`);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/leads', (req, res) => {
    const search = String(req.query.search || '').trim().toLowerCase();
    const status = String(req.query.status || '').trim();
    if (status && !STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status filter.' });
    let leads = getAll.all();
    if (search) leads = leads.filter((lead) => lead.name.toLowerCase().includes(search));
    if (status) leads = leads.filter((lead) => lead.status === status);
    res.json({ data: leads });
  });
  app.get('/api/leads/:id', (req, res) => {
    const lead = getOne.get(Number(req.params.id));
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });
    res.json({ data: lead });
  });
  app.post('/api/leads', (req, res) => {
    const { errors, value } = validateLead(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
    const result = insert.run(value);
    res.status(201).json({ data: getOne.get(result.lastInsertRowid) });
  });
  app.put('/api/leads/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1 || !getOne.get(id)) return res.status(404).json({ message: 'Lead not found.' });
    const { errors, value } = validateLead(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
    update.run({ ...value, id });
    res.json({ data: getOne.get(id) });
  });
  app.delete('/api/leads/:id', (req, res) => {
    const id = Number(req.params.id);
    const result = db.prepare('DELETE FROM leads WHERE id = ?').run(id);
    if (!result.changes) return res.status(404).json({ message: 'Lead not found.' });
    res.status(204).end();
  });
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  });
  return app;
}
