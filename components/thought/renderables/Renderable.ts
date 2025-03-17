import { Vec2 } from "~/lib/math";
import type { Thought } from "~/types/Thought";

export class Renderable implements Thought.Renderable  {
  public id: string 
  public isRoot: boolean;
  public type: string
  public title: string
  public position: Vec2;
  public box: { width: number; height: number; padding: number };
  public zIndex: number;
  public followers: Thought.Follower[] = [];
  public content: Thought.Document[];
  public parentId: string | null;
  public _editorState: Thought.Renderable["_editorState"] = {
    hovered: false,
    selected: false,
    editing: false,
    dragging: false,
    resizing: false
  }

  constructor(document: Thought.Document) {
    this.id = document.id,
    this.type = document.type,
    this.title = document.title,
    this.position = new Vec2(document.position_x, document.position_y),
    this.box = { width: document.box_width, height: document.box_height, padding: document.box_padding },
    this.zIndex = document.z_index,
    this.content = [],
    this.followers = []
    this.parentId = document.parent_id
    this.isRoot = document.is_root
    this.content = document.content ?? []
  }

  render(ctx: CanvasRenderingContext2D, viewport: Thought.Viewport, entity: Thought.Renderable) {}
}