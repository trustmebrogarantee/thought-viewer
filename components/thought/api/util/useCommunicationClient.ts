import EventEmitter from "eventemitter3";
import type { Thought } from "~/types/Thought";
import { renderable } from "./renderable";
import { createSharedComposable } from "#imports";
import { document } from "./document";

export const useCommunicationClient = createSharedComposable(() => {
  const events = new EventEmitter<{ 
    'node:moved': (args: { nodeId: string, newParentId: string | null }) => void,
    'document:created': (document: Thought.Document) => void 
  }>();

  const nonReactiveData: Thought.Renderable[] = []
  const { data, status, refresh } = useAsyncData('documents', async () => {
    const response: Thought.Document[] = await $fetch('/api/documents');
    return response.map(renderable.fromDocument)
  }, { default: () => [], lazy: false, server: true });

  watch(data, newData => {
    nonReactiveData.splice(0, nonReactiveData.length)
    for (const renderable of newData) {
      if (renderable.isRoot) continue;
      nonReactiveData.push(renderable);
    }
  })

  async function moveNode(nodeId: string, newParentId: string | null): Promise<boolean> {
    try {
      await $fetch('/api/relations', {
        method: 'PUT',
        body: { nodeId, newParentId },
      });
      events.emit('node:moved', { nodeId, newParentId })
      await refresh();
      console.log('Перемещение успешно');
      return true;
    } catch (error) {
      console.error('Ошибка перемещения:', error);
      alert('Не удалось переместить элемент.');
      return false;
    }
  }
  
  async function addDocument (title: string): Promise<void> {
    if (!title) return;
    try {
      const newId = Date.now().toString();
      const response: Thought.Document = await $fetch('/api/documents', {
        method: 'POST',
        body: document.fromTitle(title),
      });
      await refresh();
      console.log(`Добавлен элемент: ${newId}`);
    } catch (error) {
      console.error('Ошибка добавления:', error);
      alert('Не удалось добавить элемент.');
    }
  }
  
  const rootDocuments = computed(() => data.value.filter((d) => !d.parentId));

  return {
    data,
    nonReactiveData,
    rootDocuments,
    moveNode,
    addDocument,
    refresh,
    events,
    status
  };
})