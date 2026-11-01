import type { JSONContent } from "@tiptap/react";

export type { JSONContent };

export const EMPTY_CONTRACT_CONTENT: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function nodeText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(nodeText).join("");
}

export function collectTaskItems(doc: JSONContent): { id: string; label: string; checked: boolean }[] {
  const items: { id: string; label: string; checked: boolean }[] = [];
  let counter = 0;

  function walk(node: JSONContent) {
    if (node.type === "taskItem") {
      counter += 1;
      items.push({
        id: `task-${counter}`,
        label: nodeText(node).trim(),
        checked: Boolean(node.attrs?.checked),
      });
    }
    (node.content ?? []).forEach(walk);
  }

  walk(doc);
  return items;
}

export function hasTaskItem(doc: JSONContent): boolean {
  return collectTaskItems(doc).length > 0;
}

export function isContentEmpty(doc: JSONContent): boolean {
  return nodeText(doc).trim().length === 0;
}
