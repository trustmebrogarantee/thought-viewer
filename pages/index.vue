<script setup lang="ts">
import DashboardAroundCanvas from '~/components/DashboardAroundCanvas.vue';
import { useTemplateRef, onMounted, ref, watch, unref } from 'vue';
import { drawInOrder } from '~/components/canvas/drawInOrder';
import type { DataItem } from '~/components/canvas/thoughts';
import { card, title } from '~/components/canvas/thoughts';
import { CanvasDirector } from '~/components/canvas/CanvasDirector';
import { UIControlResize } from '~/components/canvas/ui-controls/UIControlResize';
import DocumentTree from '~/components/DocumentTree.vue';
import DocumentCreationWindow from '~/components/DocumentCreationWindow.vue';
import { useDocumentTree } from '~/composables/useDocumentTree';
import LoaderBase from '~/components/LoaderBase.vue';

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas-ref');
const creationWindow = ref(null)
const isAwaited = ref(false);

const { documents, rootDocuments, moveNode, addDocument, pending } = useDocumentTree();

const createDocument = (text: string) => {
  if (text.trim().length > 0) {
    addDocument(text);
    creationWindow.value.dismiss();
  }
}

const dataItems: DataItem = []
watch(documents, (docs) => {
  dataItems.splice(0, dataItems.length)
  for (const doc of docs) {
    if (doc.isRoot) continue;
    dataItems.push({
      ...doc,
      _editorState: {
        hovered: false,
        selected: false,
        editing: false,
        dragging: false,
        resizing: false
      },
      followers: []
    })
  }
})

onMounted(() => {

  // if (creationWindow.value) creationWindow.value.call()
  type DataStates = {
    selected: null | DataItem,
    hovered: null | DataItem
  }

  const states: DataStates = {
    selected: null,
    hovered: null
  }

  setTimeout(() => {
    if (!canvasRef.value) return;

    const controls = {
      controlResize: null
    }

    const scene = new CanvasDirector(
      canvasRef,
      dataItems,
      states,
      (ctx, camera, object) => {
        if (object.type === 'box') {
          drawInOrder<DataItem>(
            ctx,
            camera,
            object,
            { title, card },
            ['card', 'title'],
            ['title', 'card']
          )
        }

        // if (object.followers) {
        //   object.followers.forEach(follower => {
        //     follower.render()
        //   })
        // }
      },
      {
        onSelect: (entity, viewport) => {
          console.log('onSelect', entity, viewport);
          controls.controlResize = new UIControlResize(entity)
          entity.followers = controls.controlResize.followers
          
        },
        onDeselect: (entity, viewport) => {
          entity.followers = []
          console.log('onDeselect', entity, viewport);
        },
        onFollowerMousedown: (follower, viewport) => {
          console.log('follower mousedown', follower)
          follower.styleDragStart()
        },
        onFollowerDrag: (follower, viewport, { deltaX, deltaY }) => {
          console.log('follower drag', follower)
          if (states.selected) {
            if (follower.type === 'button:icon:resize') {
              follower.resizeEntity(deltaX, deltaY, (dx, dy) => {
                scene.moveSelectedByNotAnimated(dx, dy)
              })
            }
          }
        },
        onFollowerMouseup: (follower, viewport) => {
          console.log('follower mouseup', follower)
          follower.styleDragStop()
        }
     })
      
      //  scene.userInput.on('click', (x, y, object, camera) => {
      //     console.log({ x, y, object, camera });

      //     if (states.selected && states.selected !== object) {
      //       states.selected._editorState.selected = false
      //       states.selected.zIndex = 0
      //       states.selected = null
      //     }

      //     if (object) {
      //       object._editorState.selected = true;
      //       states.selected = object as DataItem;
      //       states.selected.zIndex = 1
      //     }
      //   })
      
    isAwaited.value = true;
  }, 2000);
});
</script>

<template>
  <DocumentCreationWindow ref="creationWindow" @create="createDocument" />
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