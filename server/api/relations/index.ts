// server/api/relations/index.ts
import db from '~/server/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { nodeId, newParentId } = body;

  if (!nodeId) {
    throw createError({ statusCode: 400, message: 'Missing nodeId' });
  }

  try {
    await db.query('BEGIN');

    // Удаляем старую связь
    await db.query('DELETE FROM relations WHERE child_id = $1', [nodeId]);

    // Добавляем новую связь, если указан новый родитель
    if (newParentId) {
      const cycleCheck = await db.query(`
        WITH RECURSIVE tree AS (
          SELECT child_id FROM relations WHERE parent_id = $1
          UNION ALL
          SELECT r.child_id FROM relations r
          JOIN tree t ON r.parent_id = t.child_id
        )
        SELECT COUNT(*) as count FROM tree WHERE child_id = $2
      `, [newParentId, nodeId]);

      if (parseInt(cycleCheck.rows[0].count) > 0) {
        throw new Error('Cyclic dependency detected');
      }

      await db.query('INSERT INTO relations (parent_id, child_id) VALUES ($1, $2)', [newParentId, nodeId]);
    }

    await db.query('COMMIT');
    return { success: true };
  } catch (error) {
    await db.query('ROLLBACK');
    throw createError({ statusCode: 400, message: (error as Error).message || 'Invalid move operation' });
  }
});