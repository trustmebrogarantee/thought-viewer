<script setup>

</script>

<template>
  <div>
    <NuxtPage />
    <NuxtRouteAnnouncer />
  </div>
</template>

<style lang="scss">
html,body {
  height: 100%;
}

body {
  margin: 0;
  display: flex;
}

#__nuxt {
  flex: 1;
  display: flex;
  flex-direction: column;
  & > * {
    flex: 1;
  display: flex;
  flex-direction: column;
  }
}

canvas {
  border: unset;
  display: flex;
  margin: 0;
}
</style>