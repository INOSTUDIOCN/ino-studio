"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { EMPTY_CONTRACT_CONTENT, type JSONContent } from "@/lib/contract-content";
import { markdownToContractContent } from "@/lib/markdown-to-contract";

const buttonClass =
  "rounded-lg border border-ink/10 bg-paper/70 px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors duration-150 hover:text-ink data-[active=true]:bg-ink data-[active=true]:text-paper";

export function ContractEditor({
  name,
  initialContent,
  labels,
}: {
  name: string;
  initialContent?: JSONContent;
  labels: {
    heading: string;
    bold: string;
    bulletList: string;
    checklist: string;
    paragraph: string;
    importToggle: string;
    importPlaceholder: string;
    importConvert: string;
  };
}) {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [contentJson, setContentJson] = useState<JSONContent>(initialContent ?? EMPTY_CONTRACT_CONTENT);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      TaskList,
      TaskItem.configure({ nested: false }),
    ],
    content: initialContent ?? EMPTY_CONTRACT_CONTENT,
    editorProps: {
      attributes: {
        class: "contract-editor-content min-h-[320px] rounded-2xl border border-ink/10 bg-paper/70 px-4 py-3 text-sm text-ink focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      setContentJson(editor.getJSON());
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(contentJson)} readOnly />

      {editor && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={buttonClass}
          >
            {labels.heading}
          </button>
          <button
            type="button"
            data-active={editor.isActive("paragraph")}
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={buttonClass}
          >
            {labels.paragraph}
          </button>
          <button
            type="button"
            data-active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={buttonClass}
          >
            {labels.bold}
          </button>
          <button
            type="button"
            data-active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={buttonClass}
          >
            {labels.bulletList}
          </button>
          <button
            type="button"
            data-active={editor.isActive("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={buttonClass}
          >
            {labels.checklist}
          </button>
          <button
            type="button"
            data-active={showImport}
            onClick={() => setShowImport((value) => !value)}
            className={buttonClass}
          >
            {labels.importToggle}
          </button>
        </div>
      )}

      {showImport && (
        <div className="flex flex-col gap-2 rounded-2xl border border-ink/10 bg-paper/50 p-3">
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            rows={8}
            placeholder={labels.importPlaceholder}
            className="w-full resize-none rounded-xl border border-ink/10 bg-paper/80 px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-ink/30 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (!editor || !importText.trim()) return;
              const json = markdownToContractContent(importText);
              setContentJson(json);
              editor.commands.setContent(json, { emitUpdate: false });
              setImportText("");
              setShowImport(false);
            }}
            className="self-start rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            {labels.importConvert}
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
