import { v4 as uuid } from 'uuid'
import type { Thought } from '~/types/Thought'

export const document = {
  fromTitle (title: string): Thought.Document {
    return {
      id: uuid(),
      type: "box",
      title,
      position_x: 0,
      position_y: 0,
      box_width: 180,
      box_height: 40,
      box_padding: 0,
      z_index: 0,
      is_root: false,
      parent_id: null
    }
  },

  fromRenderable(entity: Thought.Renderable): Thought.Document {
    return {
      id: uuid(),
      type: entity.type,
      title: entity.title,
      position_x: entity.position.x,
      position_y: entity.position.y,
      box_width: entity.box.width,
      box_height: entity.box.height,
      box_padding: entity.box.padding,
      z_index: entity.zIndex,
      parent_id: entity.parentId,
      is_root: false
    }
  }
}