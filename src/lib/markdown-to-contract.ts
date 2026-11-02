import type { JSONContent } from "@/lib/contract-content";

function parseInline(text: string): JSONContent[] {
  const parts: JSONContent[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", text: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "text", text: match[1], marks: [{ type: "bold" }] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", text: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", text }];
}

export function markdownToContractContent(markdown: string): JSONContent {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const content: JSONContent[] = [];
  let currentList: { type: "bulletList" | "taskList"; items: JSONContent[] } | null = null;

  function flushList() {
    if (currentList) {
      content.push({ type: currentList.type, content: currentList.items });
      currentList = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    const headingMatch = line.match(/^#{1,3}\s+(.*)$/);
    if (headingMatch) {
      flushList();
      content.push({ type: "heading", attrs: { level: 2 }, content: parseInline(headingMatch[1]) });
      continue;
    }

    const taskMatch = line.match(/^[-*]\s+\[([ xX]?)\]\s+(.*)$/);
    if (taskMatch) {
      if (!currentList || currentList.type !== "taskList") {
        flushList();
        currentList = { type: "taskList", items: [] };
      }
      currentList.items.push({
        type: "taskItem",
        attrs: { checked: taskMatch[1].toLowerCase() === "x" },
        content: [{ type: "paragraph", content: parseInline(taskMatch[2]) }],
      });
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "bulletList") {
        flushList();
        currentList = { type: "bulletList", items: [] };
      }
      currentList.items.push({
        type: "listItem",
        content: [{ type: "paragraph", content: parseInline(bulletMatch[1]) }],
      });
      continue;
    }

    flushList();
    content.push({ type: "paragraph", content: parseInline(line) });
  }

  flushList();

  return { type: "doc", content: content.length > 0 ? content : [{ type: "paragraph" }] };
}
