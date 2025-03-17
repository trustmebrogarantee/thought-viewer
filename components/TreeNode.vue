<!-- components/TreeNode.vue -->
<template>
  <li class="tree-node">
    <NodeHeader :doc="doc" :documents="documents" :move-node="moveNode" :is-expanded="isExpanded" @toggle="toggleExpand" />
    <ul v-if="isExpanded && doc.content.length" class="children">
      <TreeNode
        v-for="child in doc.content"
        :key="child.id"
        :doc="child"
        :documents="documents"
        :move-node="moveNode"
        :level="level + 1"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Thought } from '~/types/Thought';
import NodeHeader from './NodeHeader.vue';

defineProps<{
  doc: Thought.Renderable;
  documents: Thought.Renderable[];
  moveNode: (nodeId: string, newParentId: string | null) => Promise<boolean>;
  level: number;
}>();

// Ноды-родители открыты по умолчанию
const isExpanded = ref(true);

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}
</script>

<style scoped>
.tree-node {
  margin: 2px 0;
}
.children {
  list-style: none;
  padding-left: 16px;
  margin: 0;
}
</style>