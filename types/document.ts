// types/document.ts
export namespace DocumentTypes {
  export interface Renderable {
    title: string;
    id: string;
    content: Renderable[];
    position: { x: number; y: number };
    box: { width: number; height: number; padding?: number };
    zIndex: number;
    type: string;
    isRoot: boolean;
    parentId?: string;
  }
}