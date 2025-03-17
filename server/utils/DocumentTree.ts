// server/utils/DocumentTree.ts
export interface Renderable {
  title: string;
  id: string;
  content: Renderable[];
  position: { x: number; y: number };
  box: { width: number; height: number; padding?: number, padding: 8 };
  zIndex: number;
  type: string;
  isRoot: boolean;
  parentId?: string;
}

export class DocumentTree {
  private documents: Map<string, Renderable>;
  private relations: Map<string, Renderable[]>;
  public root!: Renderable;

  constructor() {
    this.documents = new Map();
    this.relations = new Map();
  }

  addDocument(doc: Renderable): Renderable {
    const newDoc = { ...doc, content: doc.content || [] };
    this.documents.set(doc.id, newDoc);
    this.relations.set(doc.id, newDoc.content);
    console.log(`Added document: ${doc.id}`);
    return newDoc;
  }


  addRelation(fromId: string, toId: string): void {
    if (!this.documents.has(fromId) || !this.documents.has(toId)) {
      throw new Error("Один из документов не найден");
    }
    const parent = this.documents.get(fromId);
    const child = this.documents.get(toId);
    if (parent && child) {
      child.parentId = fromId;
      parent.content.push(child);
      this.relations.set(fromId, parent.content);
    }
  }

  moveNode(nodeId: string, newParentId: string | null): boolean {
    const node = this.documents.get(nodeId);
    if (!node) {
      console.warn(`Узел не найден: ${nodeId}`);
      return false;
    }

    if (newParentId && this.isAncestor(nodeId, newParentId)) {
      console.warn(`Циклическая зависимость: ${nodeId} -> ${newParentId}`);
      return false;
    }

    const oldParentId = node.parentId;
    if (oldParentId) {
      const oldParent = this.documents.get(oldParentId);
      if (oldParent) {
        oldParent.content = oldParent.content.filter((child) => child.id !== nodeId);
        this.relations.set(oldParentId, oldParent.content);
      }
    }

    node.parentId = newParentId || undefined;
    if (newParentId) {
      const newParent = this.documents.get(newParentId);
      if (newParent) {
        newParent.content.push(node);
        this.relations.set(newParentId, newParent.content);
      }
    }

    console.log(`Moved ${nodeId} to ${newParentId || 'root'}`);
    return true;
  }

  isAncestor(nodeId: string, potentialAncestorId: string): boolean {
    let current = this.documents.get(potentialAncestorId);
    while (current?.parentId) {
      if (current.parentId === nodeId) return true;
      current = this.documents.get(current.parentId);
    }
    return false;
  }

  getAllDocuments(): Renderable[] {
    return Array.from(this.documents.values());
  }

  getAllRelations(): Rela[] {
    return Array.from(this.documents.values());
  }
}

const documentTree = new DocumentTree();

// Инициализация данных
const root = documentTree.addDocument({
  title: "Root",
  id: "1",
  content: [],
  position: { x: 0, y: 0 },
  box: { width: 200, height: 50, padding: 8 },
  zIndex: 1,
  type: "root",
  isRoot: true,
});
documentTree.root = root


documentTree.addDocument({
  title: "Child 1",
  id: "2",
  content: [],
  position: { x: 0, y: 60 },
  box: { width: 180, height: 40, padding: 8 },
  zIndex: 2,
  type: "box",
  isRoot: false,
});
documentTree.addDocument({
  title: "Child 2",
  id: "3",
  content: [],
  position: { x: 0, y: 110 },
  box: { width: 180, height: 40, padding: 8 },
  zIndex: 2,
  type: "box",
  isRoot: false,
});
documentTree.addDocument({
  title: "Grandchild 1",
  id: "4",
  content: [],
  position: { x: 0, y: 160 },
  box: { width: 160, height: 30, padding: 8 },
  zIndex: 3,
  type: "box",
  isRoot: false,
});
documentTree.addDocument({
  title: "Grandchild 2",
  id: "5",
  content: [],
  position: { x: 0, y: 200 },
  box: { width: 160, height: 30, padding: 8 },
  zIndex: 3,
  type: "box",
  isRoot: false,
});
documentTree.addRelation("1", "2");
documentTree.addRelation("1", "3");
documentTree.addRelation("2", "4");
documentTree.addRelation("2", "5");

export default documentTree;