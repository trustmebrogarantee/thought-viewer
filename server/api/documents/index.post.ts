import db from '~/server/db';;
import type { Thought } from '~/types/Thought';

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as Thought.Document;
  const { id, title, position_x, position_y, box_width, box_height, box_padding, z_index, type, is_root } = body;

  if (!id || !title) {
    throw createError({ statusCode: 400, message: 'Missing id or title' });
  }

  await db.query(`
    INSERT INTO documents (id, title, position_x, position_y, box_width, box_height, box_padding, z_index, type, is_root)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [id, title, position_x, position_y, box_width, box_height, box_padding, z_index, type, is_root]);

  return { success: true };
});