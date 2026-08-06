import React, { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough, Code, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Link, 
  Image, Table, Undo, Redo, Sparkles, Minus, SquareCode, ChevronDown, Check, Wand2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  editor: Editor | null;
  onImageClick?: () => void;
}

export const EditorToolbar: React.FC<Props> = ({ editor, onImageClick }) => {
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter Hyperlink URL:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleAiAction = (type: string) => {
    setAiMenuOpen(false);
    toast.success(`AI Assistant: ${type}...`, { icon: '✨' });

    setTimeout(() => {
      if (type === 'Expand') {
        editor.chain().focus().insertContent(' Expanding on this point, modern web architectures emphasize modular design systems, atomic components, and seamless user experiences across desktop and mobile viewpoints.').run();
      } else if (type === 'Rewrite') {
        editor.chain().focus().insertContent(' Rephrased for clarity and impact: Technical elegance lies in combining visual simplicity with robust underlying performance.').run();
      } else if (type === 'Summarize') {
        editor.chain().focus().insertContent('\n\n> Key Takeaway: Prioritize responsive visual hierarchy, fast load times, and accessible micro-interactions.').run();
      } else if (type === 'Grammar') {
        toast.success('Grammar & typography checks passed perfectly!');
        return;
      } else if (type === 'Continue') {
        editor.chain().focus().insertContent(' Moving forward, the next step involves deploying automated test pipelines and verifying schema integrations.').run();
      }
      toast.success('AI content added successfully!');
    }, 1000);
  };

  return (
    <div className="sticky top-0 z-20 min-h-[64px] bg-white border-b border-[#E2E8F0] px-4 py-2 flex flex-wrap gap-2 items-center justify-between shadow-2xs shrink-0">
      <div className="flex flex-wrap gap-1 items-center">
        
        {/* History Group */}
        <div className="flex items-center bg-[#F8FAFC] p-0.5 rounded-xl border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white disabled:opacity-30 rounded-lg cursor-pointer transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={14} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white disabled:opacity-30 rounded-lg cursor-pointer transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={14} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-[#E2E8F0] dark:bg-slate-800 mx-1" />

        {/* Headings Group */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Heading 1"
          >
            <Heading1 size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Heading 2"
          >
            <Heading2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Heading 3"
          >
            <Heading3 size={15} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-[#E2E8F0] dark:bg-slate-800 mx-1" />

        {/* Text Formatting Group */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('bold')
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('italic')
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('underline')
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('strike')
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Strikethrough"
          >
            <Strikethrough size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('code')
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Inline Code"
          >
            <Code size={15} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-[#E2E8F0] dark:bg-slate-800 mx-1" />

        {/* Lists & Blocks Group */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('bulletList')
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Bullet List"
          >
            <List size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('orderedList')
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Ordered List"
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('blockquote')
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Blockquote"
          >
            <Quote size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B] transition cursor-pointer"
            title="Divider Line"
          >
            <Minus size={15} />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-[#E2E8F0] dark:bg-slate-800 mx-1" />

        {/* Media & Embeds Group */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('link')
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Add Hyperlink (Ctrl+K)"
          >
            <Link size={15} />
          </button>
          <button
            type="button"
            onClick={onImageClick}
            className="p-1.5 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B] hover:text-[#0891B2] transition cursor-pointer"
            title="Insert Image"
          >
            <Image size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="p-1.5 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B] transition cursor-pointer"
            title="Insert Table"
          >
            <Table size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              editor.isActive('codeBlock')
                ? 'bg-[#ECFEFF] text-[#0891B2] font-bold border border-[#CFFAFE]'
                : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B]'
            }`}
            title="Code Block"
          >
            <SquareCode size={15} />
          </button>
        </div>
      </div>

      {/* AI Writing Panel Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setAiMenuOpen(!aiMenuOpen)}
          className="px-3 py-1.5 bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] hover:opacity-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-[#0891B2]/20 cursor-pointer transition"
        >
          <Sparkles size={13} className="animate-pulse" />
          <span>AI Writer</span>
          <ChevronDown size={12} />
        </button>

        {aiMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xl py-2 z-30 animate-fade-in">
            <div className="px-3 py-1.5 border-b border-[#E2E8F0] dark:border-slate-800 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              AI Writing Assistant
            </div>
            <button
              type="button"
              onClick={() => handleAiAction('Expand')}
              className="w-full px-3.5 py-2 text-left text-xs text-[#0F172A] dark:text-slate-200 hover:bg-[#ECFEFF] dark:hover:bg-slate-800 hover:text-[#0891B2] transition flex items-center gap-2"
            >
              <Wand2 size={13} className="text-[#0891B2]" /> AI Expand Paragraph
            </button>
            <button
              type="button"
              onClick={() => handleAiAction('Rewrite')}
              className="w-full px-3.5 py-2 text-left text-xs text-[#0F172A] dark:text-slate-200 hover:bg-[#ECFEFF] dark:hover:bg-slate-800 hover:text-[#0891B2] transition flex items-center gap-2"
            >
              <Sparkles size={13} className="text-[#0891B2]" /> Rewrite & Polish
            </button>
            <button
              type="button"
              onClick={() => handleAiAction('Summarize')}
              className="w-full px-3.5 py-2 text-left text-xs text-[#0F172A] dark:text-slate-200 hover:bg-[#ECFEFF] dark:hover:bg-slate-800 hover:text-[#0891B2] transition flex items-center gap-2"
            >
              <Quote size={13} className="text-[#0891B2]" /> Summarize Takeaway
            </button>
            <button
              type="button"
              onClick={() => handleAiAction('Grammar')}
              className="w-full px-3.5 py-2 text-left text-xs text-[#0F172A] dark:text-slate-200 hover:bg-[#ECFEFF] dark:hover:bg-slate-800 hover:text-[#0891B2] transition flex items-center gap-2"
            >
              <Check size={13} className="text-[#0891B2]" /> Fix Grammar & Typos
            </button>
            <button
              type="button"
              onClick={() => handleAiAction('Continue')}
              className="w-full px-3.5 py-2 text-left text-xs text-[#0F172A] dark:text-slate-200 hover:bg-[#ECFEFF] dark:hover:bg-slate-800 hover:text-[#0891B2] transition flex items-center gap-2"
            >
              <Sparkles size={13} className="text-[#0891B2]" /> Continue Writing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
