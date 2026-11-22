import 'dotenv/config';
import { createDatabase } from './db.js';
import { createApp } from './app.js';
const db = createDatabase();
const app = createApp(db);
const port = Number(process.env.PORT) || 5000;
app.listen(port, () => console.log(`Lead Manager API running at http://localhost:${port}`));
