import type { Thought } from "~/types/Thought"
import { Renderable, UIComponentCard } from "~/components/thought/renderables"

export const renderable =  {
  fromDocument: (document: Thought.Document): Thought.Renderable => {
    if (document.type === 'box') return new UIComponentCard(document)
    return new Renderable(document)
  }
}