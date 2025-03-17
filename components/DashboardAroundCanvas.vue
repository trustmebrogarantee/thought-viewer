<script setup lang="ts">
import { useElementSize, useMounted } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const canvasContainer = useTemplateRef('canvas-container')
const { width, height } = useElementSize(canvasContainer)
const isMounted = useMounted()
</script>

<template>
  <section class="wrapper">
    <aside class="sidebar-container">
      <slot name="sidebar" />
    </aside>
    <main ref="canvas-container" class="canvas-container">
      <slot :isMounted="isMounted" :width="width" :height="height" name="main" />
    </main>
  </section>
</template>

<style scoped>
.wrapper {
  flex-grow: 1;
  display: flex;
  height: 100%;
}
.sidebar-container {
  box-sizing: border-box;
  padding: 8px 0px;
  border-right: 0.75px solid rgb(115, 115, 115);
  display: flex;
  height: 100%;
  overflow-y: auto;
  flex-direction: column;
  width: 380px;
  flex-grow: 0;
  flex-shrink: 0;
}
.canvas-container {
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
  display: flex;
  height: 100%;
  flex-grow: 1;
  flex-shrink: 1;
}
</style>