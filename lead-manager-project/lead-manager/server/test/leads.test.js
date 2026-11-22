import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createDatabase } from '../src/db.js';
import { createApp } from '../src/app.js';

test('lead API supports create, list, update, filter, validation and delete', async () => {
  const db = createDatabase(':memory:');
  const app = createApp(db);
  const invalid = await request(app).post('/api/leads').send({ name: '', email: 'bad' });
  assert.equal(invalid.status, 400);
  assert.ok(invalid.body.errors.name);
  assert.ok(invalid.body.errors.email);

  const created = await request(app).post('/api/leads').send({
    name: 'Avery Smith', email: 'avery@example.com', phone: '1234567890',
    company: 'Acme', source: 'Website', status: 'New'
  });
  assert.equal(created.status, 201);
  const id = created.body.data.id;
  assert.equal(created.body.data.name, 'Avery Smith');

  const filtered = await request(app).get('/api/leads?search=avery&status=New');
  assert.equal(filtered.body.data.length, 1);

  const updated = await request(app).put(`/api/leads/${id}`).send({
    name: 'Avery Smith', email: 'avery@example.com', phone: '', company: 'Acme', source: 'Referral', status: 'Qualified'
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.status, 'Qualified');

  const removed = await request(app).delete(`/api/leads/${id}`);
  assert.equal(removed.status, 204);
  const missing = await request(app).get(`/api/leads/${id}`);
  assert.equal(missing.status, 404);
  db.close();
});
