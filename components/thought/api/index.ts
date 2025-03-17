import type { Thought } from "~/types/Thought";

import { document } from "./util/document";
import { renderable } from "./util/renderable";
import { useCommunicationClient } from "./util/useCommunicationClient";
import { CanvasDirector } from "~/components/thought/core";
import { ResizeFollower, UIControlResize } from "~/components/thought/ui-controls/UIControlResize";

export { document, renderable, useCommunicationClient }

export const thoughtApi = () => {
  const client = useCommunicationClient()
  const state: Thought.ActiveEntityStates<Thought.Renderable> = {
    selected: null,
    hovered: null,
  }
  const uiControls: { 
    resize: UIControlResize | null
   } = {
    resize: null
  }

  return {
    dataStatus: client.status,
    
    loadCanvasApplication(canvasRef: Ref<HTMLCanvasElement>) {
      const canvasDirector = new CanvasDirector(
        canvasRef,
        client.nonReactiveData,
        state,
        {
          onSelect: (entity, viewport) => {
            console.log('onSelect', entity, viewport);
            uiControls.resize = new UIControlResize(entity)
            entity.followers = uiControls.resize.followers
            
          },
          onDeselect: (entity, viewport) => {
            entity.followers = []
            console.log('onDeselect', entity, viewport);
          },
          onFollowerMousedown: (follower, viewport) => {
            console.log('follower mousedown', follower)
            if (follower instanceof ResizeFollower) follower.styleDragStart()
          },
          onFollowerDrag: (follower, viewport, { deltaX, deltaY }) => {
            console.log('follower drag', follower)
            if (state.selected) {
              if (follower instanceof ResizeFollower) {
                follower.resizeEntity(deltaX, deltaY, (dx, dy) => {
                  canvasDirector.moveSelectedByNotAnimated(dx, dy)
                })
              }
            }
          },
          onFollowerMouseup: (follower, viewport) => {
            console.log('follower mouseup', follower)
            if (follower instanceof ResizeFollower) follower.styleDragStop()
          }
        }
      )
    }

  }
}