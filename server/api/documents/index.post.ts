// server/api/documents/index.post.ts
import db from '~/server/db';
import { DocumentTypes } from '~/types/document';

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as DocumentTypes.Renderable;
  const { id, title, position, box, zIndex, type, isRoot } = body;

  if (!id || !title) {
    throw createError({ statusCode: 400, message: 'Missing id or title' });
  }

  await db.query(`
    INSERT INTO documents (id, title, position_x, position_y, box_width, box_height, z_index, type, is_root)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [id, title, position.x, position.y, box.width, box.height, zIndex, type, isRoot]);

  return { success: true };
});