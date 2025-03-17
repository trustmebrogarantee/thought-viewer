import type { Vec2 } from "~/components/canvas/CanvasDirector";

export interface EditorState {
  hovered: boolean;
  selected: boolean;
  editing: boolean;
  dragging: boolean;
  resizing: boolean;
}

export interface Follower {
  type: 'button:icon:add' | 'button:icon:resize'
  offset: Vec2; // Относительное смещение от entity
  position: { x: number; y: number }; // Абсолютная позиция (обновляется автоматически)
  box: { width: number; height: number }; // Размеры для рендеринга
  zIndex?: number; // Опциональный zIndex (по умолчанию чуть выше entity)
}

export interface DataItem {
  type: string;
  title: string;
  position: { x: number; y: number };
  box: { width: number; height: number; padding: number };
  zIndex: number;
  content: any[];
  _editorState: EditorState;
  followers?: Follower[]
}

export interface TitleProps {
  drawText: () => void;
  height: number;
}

export interface CardProps extends DataItem {}