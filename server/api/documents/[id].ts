// server/api/documents/[id].ts
import { defineEventHandler } from 'h3';
import documentTree from '~/server/utils/DocumentTree'; // Импорт default

export default defineEventHandler((event) => {
  const id = event.context.params?.id;
  if (!id) throw new Error("ID не указан");
  const doc = documentTree.getDocument(id);
  if (!doc) throw new Error("Документ не найден");
  return doc;
});