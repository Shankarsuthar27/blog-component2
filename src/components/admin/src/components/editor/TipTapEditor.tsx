import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import CharacterCount from '@tiptap/extension-character-count';
import { EditorToolbar } from './EditorToolbar';
import { Clock, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  onWordCountChange?: (count: number) => void;
  status?: string;
}

export const TipTapEditor: React.FC<Props> = ({ value, onChange, onWordCountChange, status = 'draft' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#D80408] underline cursor-pointer font-medium hover:text-[#0EA5E9]',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full my-6 shadow-sm border border-[#E2E8F0]',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[700px] px-8 md:px-10 py-8 text-[18px] leading-[1.9] text-[#0F172A] break-words font-sans selection:bg-[#ECFEFF] selection:text-[#D80408]',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      if (onWordCountChange) {
        const words = editor.storage.characterCount.words();
        onWordCountChange(words);
      }
    },
  });

  // Sync external content changes (e.g. when fetching existing article data)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
      if (onWordCountChange) {
        const words = editor.storage.characterCount.words();
        onWordCountChange(words);
      }
    }
  }, [value, editor]);

  const handleImageUploadPrompt = () => {
    const url = window.prompt('Enter Image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const wordCount = editor ? editor.storage.characterCount.words() : 0;
  const charCount = editor ? editor.storage.characterCount.characters() : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="border border-[#E2E8F0] bg-white rounded-2xl overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-[#D80408]/20 focus-within:border-[#D80408] transition duration-200 flex flex-col relative">
      
      {/* Grouped Notion/Ghost-style Toolbar (Sticky at top-0 of editor container) */}
      <EditorToolbar 
        editor={editor} 
        onImageClick={handleImageUploadPrompt} 
      />

      {/* Writing Canvas Container */}
      <div className="flex-1 min-h-[700px] bg-white relative">
        <EditorContent editor={editor} className="min-h-[700px] flex-1" />
      </div>

      {/* Pure White Writing Workspace Status Bar */}
      <div className="border-t border-[#E2E8F0] bg-white px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-[#64748B]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <FileText size={14} className="text-[#D80408]" />
            <strong className="text-[#0F172A] font-mono">{wordCount}</strong> Words
          </span>
          <span className="text-[#E2E8F0]">|</span>
          <span className="font-mono">
            <strong className="text-[#0F172A]">{charCount}</strong> Characters
          </span>
          <span className="text-[#E2E8F0]">|</span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#D80408]" />
            <span>{readingTime} min read</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
            <CheckCircle2 size={13} />
            <span>Autosaved</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#ECFEFF] text-[#D80408] border border-[#CFFAFE]">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};
export default TipTapEditor;
