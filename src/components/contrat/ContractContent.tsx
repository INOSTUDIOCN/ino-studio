"use client";

import { Fragment, useMemo, type ReactNode } from "react";
import type { JSONContent } from "@/lib/contract-content";

type Marks = { type: string }[];

function renderText(text: string, marks?: Marks, key?: number) {
  let node: ReactNode = text;
  if (marks?.some((mark) => mark.type === "bold")) {
    node = <strong key={key}>{node}</strong>;
  }
  if (marks?.some((mark) => mark.type === "italic")) {
    node = <em key={key}>{node}</em>;
  }
  return <Fragment key={key}>{node}</Fragment>;
}

function renderInline(nodes: JSONContent[] | undefined) {
  return (nodes ?? []).map((node, index) =>
    node.type === "text" ? renderText(node.text ?? "", node.marks as Marks, index) : null
  );
}

function assignTaskIds(doc: JSONContent): Map<JSONContent, string> {
  const map = new Map<JSONContent, string>();
  let counter = 0;

  function walk(node: JSONContent) {
    if (node.type === "taskItem") {
      counter += 1;
      map.set(node, `task-${counter}`);
    }
    (node.content ?? []).forEach(walk);
  }

  walk(doc);
  return map;
}

export function ContractContent({
  doc,
  checkedIds,
  onToggle,
}: {
  doc: JSONContent;
  checkedIds?: Set<string>;
  onToggle?: (id: string, checked: boolean) => void;
}) {
  const taskIds = useMemo(() => assignTaskIds(doc), [doc]);

  function renderNode(node: JSONContent, key: number): ReactNode {
    switch (node.type) {
      case "doc":
        return <Fragment key={key}>{(node.content ?? []).map((child, i) => renderNode(child, i))}</Fragment>;

      case "heading": {
        const level = (node.attrs?.level as number) ?? 2;
        const className =
          level <= 2
            ? "font-display mt-6 text-lg font-semibold text-ink first:mt-0"
            : "font-display mt-4 text-base font-semibold text-ink first:mt-0";
        if (level <= 2) return <h2 key={key} className={className}>{renderInline(node.content)}</h2>;
        return <h3 key={key} className={className}>{renderInline(node.content)}</h3>;
      }

      case "paragraph":
        return (
          <p key={key} className="mt-3 text-sm leading-relaxed text-ink-soft first:mt-0">
            {renderInline(node.content)}
          </p>
        );

      case "bulletList":
        return (
          <ul key={key} className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-ink-soft">
            {(node.content ?? []).map((child, i) => (
              <li key={i}>{(child.content ?? []).map((grandchild) => renderInline(grandchild.content))}</li>
            ))}
          </ul>
        );

      case "taskList":
        return (
          <ul key={key} className="mt-4 flex flex-col gap-2">
            {(node.content ?? []).map((child, i) => renderNode(child, i))}
          </ul>
        );

      case "taskItem": {
        const id = taskIds.get(node) ?? `task-${key}`;
        const checked = onToggle ? (checkedIds?.has(id) ?? false) : Boolean(node.attrs?.checked);
        const label = (node.content ?? []).map((child) => renderInline(child.content));

        return (
          <li
            key={key}
            className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3 text-sm text-ink"
          >
            <input
              type="checkbox"
              className="mt-0.5"
              checked={checked}
              disabled={!onToggle}
              onChange={(event) => onToggle?.(id, event.target.checked)}
            />
            <span>{label}</span>
          </li>
        );
      }

      default:
        return null;
    }
  }

  return <div className="text-left">{renderNode(doc, 0)}</div>;
}
