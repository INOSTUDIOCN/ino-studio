"use client";

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { EMPTY_CONTRACT_CONTENT, type JSONContent } from "@/lib/contract-content";

const buttonClass =
  "rounded-lg border border-ink/10 bg-paper/70 px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors duration-150 hover:text-ink data-[active=true]:bg-ink data-[active=true]:text-paper";

export function ContractEditor({
  name,
  initialContent,
  labels,
}: {
  name: string;
  initialContent?: JSONContent;
  labels: { heading: string; bold: string; bulletList: string; checklist: string; paragraph: string };
}) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

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
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = JSON.stringify(editor.getJSON());
      }
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        defaultValue={JSON.stringify(initialContent ?? EMPTY_CONTRACT_CONTENT)}
      />

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
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
