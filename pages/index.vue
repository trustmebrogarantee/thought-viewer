<script setup lang="ts">
import { useTemplateRef, onMounted, ref, watch } from 'vue';

import DashboardAroundCanvas from '~/components/DashboardAroundCanvas.vue';
import DocumentTree from '~/components/DocumentTree.vue';
import DocumentCreationWindow from '~/components/DocumentCreationWindow.vue';

import { thoughtApi } from '~/components/thought/api'

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas-ref');
const creationWindow = ref(null)
const isAwaited = ref(false);

const thoughtApplication = thoughtApi()

// const createDocument = (text: string) => {
//   if (text.trim().length > 0) {
//     addDocument(text);
//     creationWindow.value.dismiss();
//   }
// }

onMounted(() => {
  setTimeout(() => {
    thoughtApplication.loadCanvasApplication(canvasRef as Ref<HTMLCanvasElement>);
    isAwaited.value = true;
  }, 2000);
});
</script>

<template>
  <DocumentCreationWindow ref="creationWindow" />
  <DashboardAroundCanvas>
    <template #sidebar>
      <DocumentTree />
    </template>
    <template #main="{ width, height, isMounted }">
      <LoaderBase v-show="!isAwaited" class="loader1" />
      <canvas v-show="isAwaited" ref="canvas-ref" :width="width" :height="height" />
    </template>
  </DashboardAroundCanvas>
</template>

<style lang="scss" scoped>
.loader1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>