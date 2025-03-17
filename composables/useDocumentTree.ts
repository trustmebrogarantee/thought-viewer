// composables/useDocumentTree.ts
import { ref, computed } from 'vue';
import { useAsyncData } from 'nuxt/app';
import type { DocumentTypes } from '~/types/document';

export function useDocumentTree() {
  const documents = ref<DocumentTypes.Renderable[]>([]);

  const { data, pending, refresh } = useAsyncData('documents', async () => {
    const response = await $fetch('/api/documents');
    console.log('Документы загружены:', response);
    return response as DocumentTypes.Renderable[];
  }, {
    default: () => [],
    lazy: false,
    server: true,
  });

  watch(data, (newData) => {
    documents.value = newData || [];
  }, { immediate: true });

  async function moveNode(nodeId: string, newParentId: string | null): Promise<boolean> {
    try {
      await $fetch('/api/relations', {
        method: 'PUT',
        body: { nodeId, newParentId },
      });
      await refresh();
      console.log('Перемещение успешно');
      return true;
    } catch (error) {
      console.error('Ошибка перемещения:', error);
      alert('Не удалось переместить элемент.');
      return false;
    }
  }

  async function addDocument(title: string): Promise<void> {
    if (!title) return;
    try {
      const newId = Date.now().toString();
      await $fetch('/api/documents', {
        method: 'POST',
        body: {
          id: newId,
          title,
          content: [],
          position: { x: 0, y: 0 },
          box: { width: 180, height: 40 },
          zIndex: 2,
          type: "node",
          isRoot: false,
        },
      });
      await refresh();
      console.log(`Добавлен элемент: ${newId}`);
    } catch (error) {
      console.error('Ошибка добавления:', error);
      alert('Не удалось добавить элемент.');
    }
  }

  const rootDocuments = computed(() => documents.value.filter((d) => !d.parentId));

  return {
    documents,
    rootDocuments,
    moveNode,
    addDocument,
    refresh,
    pending,
  };
}