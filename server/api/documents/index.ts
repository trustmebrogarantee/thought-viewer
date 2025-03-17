import db from '~/server/db';
import { Thought } from '~/types/Thought';

export default defineEventHandler(async () => {
  const docs = await db.query('SELECT * FROM documents') as { rows: Thought.Document[] };
  const relations = await db.query('SELECT parent_id, child_id FROM relations') as { rows: { parent_id: string; child_id: string }[] };

  const docMap = new Map<string, Thought.Document>();
  docs.rows.forEach(doc => {
    doc.content = [];
    docMap.set(doc.id, doc);
  });

  relations.rows.forEach(rel => {
    const parent = docMap.get(rel.parent_id);
    const child = docMap.get(rel.child_id);
    if (parent && child) {
      parent.content!.push(child as Thought.Document);
      child.parent_id = rel.parent_id;
    }
  });

  return Array.from(docMap.values());
});