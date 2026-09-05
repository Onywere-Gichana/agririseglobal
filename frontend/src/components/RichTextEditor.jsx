import { useCallback, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { FontSize } from '../extensions/FontSize';
import { uploadApi } from '../services/api';

const FONTS = [
  { label: 'Default', value: '' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Sans', value: 'Arial, sans-serif' },
  { label: 'Mono', value: 'monospace' },
];

const SIZES = ['12px', '14px', '16px', '18px', '24px', '32px'];

function ToolbarButton({ onClick, active, children, title }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm border ${active ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ content, onChange }) {
  const fileInputRef = useRef(null);

  const uploadAndInsert = useCallback(async (file, editor) => {
    if (!file) return;
    try {
      const { url } = await uploadApi.image(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      window.alert(error.error || 'Image upload failed');
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: 'Write your post...' }),
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    editorProps: {
      handleDrop: (view, event) => {
        const image = Array.from(event.dataTransfer?.files || []).find((file) => file.type.startsWith('image/'));
        if (!image) return false;
        event.preventDefault();
        uploadAndInsert(image, editor);
        return true;
      },
      handlePaste: (view, event) => {
        const item = Array.from(event.clipboardData?.items || []).find((entry) => entry.type.startsWith('image/'));
        if (!item) return false;
        event.preventDefault();
        uploadAndInsert(item.getAsFile(), editor);
        return true;
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-slate-300 rounded overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200">
        <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></ToolbarButton>
        <ToolbarButton title="Strike" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></ToolbarButton>
        <select className="px-2 py-1 text-sm border border-slate-300 rounded bg-white" aria-label="Font family" onChange={(event) => editor.chain().focus().setFontFamily(event.target.value || null).run()} defaultValue="">
          {FONTS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
        </select>
        <select className="px-2 py-1 text-sm border border-slate-300 rounded bg-white" aria-label="Font size" onChange={(event) => event.target.value ? editor.chain().focus().setFontSize(event.target.value).run() : editor.chain().focus().unsetFontSize().run()} defaultValue="">
          <option value="">Size</option>
          {SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <input type="color" className="w-8 h-8 p-0 border border-slate-300 rounded" aria-label="Text color" onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} />
        <ToolbarButton title="H1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</ToolbarButton>
        <ToolbarButton title="H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>List</ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</ToolbarButton>
        <ToolbarButton title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</ToolbarButton>
        <ToolbarButton title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</ToolbarButton>
        <ToolbarButton title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</ToolbarButton>
        <ToolbarButton title="Link" active={editor.isActive('link')} onClick={setLink}>Link</ToolbarButton>
        <ToolbarButton title="Insert image" onClick={() => fileInputRef.current?.click()}>Image</ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { uploadAndInsert(event.target.files?.[0], editor); event.target.value = ''; }} />
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>Undo</ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>Redo</ToolbarButton>
      </div>
      <EditorContent editor={editor} className="rich-text-editor px-3 py-2 min-h-[300px]" />
    </div>
  );
}