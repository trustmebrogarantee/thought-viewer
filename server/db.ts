// server/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/nuxt_db',
});



// Инициализация таблиц
async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      position_x INTEGER NOT NULL,
      position_y INTEGER NOT NULL,
      box_width INTEGER NOT NULL,
      box_height INTEGER NOT NULL,
      z_index INTEGER NOT NULL,
      type TEXT NOT NULL,
      is_root BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS relations (
      parent_id TEXT,
      child_id TEXT,
      CONSTRAINT unique_relation UNIQUE (parent_id, child_id),
      FOREIGN KEY (parent_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (child_id) REFERENCES documents(id) ON DELETE CASCADE
    );
  `);

  // Проверка и добавление начальных данных
  const { rows } = await pool.query('SELECT COUNT(*) as count FROM documents');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO documents (id, title, position_x, position_y, box_width, box_height, z_index, type, is_root)
      VALUES 
        ('1', 'Root', 0, 0, 200, 50, 1, 'root', TRUE),
        ('2', 'Child 1', 0, 60, 180, 40, 2, 'node', FALSE),
        ('3', 'Child 2', 0, 110, 180, 40, 2, 'node', FALSE),
        ('4', 'Grandchild 1', 0, 160, 160, 30, 3, 'node', FALSE),
        ('5', 'Grandchild 2', 0, 200, 160, 30, 3, 'node', FALSE)
      ON CONFLICT (id) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO relations (parent_id, child_id)
      VALUES 
        ('1', '2'),
        ('1', '3'),
        ('2', '4'),
        ('2', '5')
      ON CONFLICT (parent_id, child_id) DO NOTHING;
    `);
  }
}

initDatabase().catch(err => console.error('Database initialization failed:', err));

export default pool;