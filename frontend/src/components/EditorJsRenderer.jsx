export default function EditorJsRenderer({ content, className = '' }) {
  const document = parseDocument(content);
  if (!document.blocks.length) {
    return <p className="text-slate-400 italic">No content yet.</p>;
  }

  return (
    <div className={`editorjs-renderer prose prose-slate max-w-none ${className}`}>
      {document.blocks.map((block, index) => (
        <Block key={block.id || `${block.type}-${index}`} block={block} />
      ))}
    </div>
  );
}

function parseDocument(content) {
  if (content && typeof content === 'object' && Array.isArray(content.blocks)) return content;
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.blocks)) return parsed;
    } catch {
      if (content.trim()) return { blocks: [{ type: 'raw', data: { html: content } }] };
    }
  }
  return { blocks: [] };
}

function InlineHtml({ html = '' }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function Block({ block }) {
  const data = block.data || {};
  switch (block.type) {
    case 'header': {
      const Tag = `h${Math.min(Math.max(Number(data.level) || 2, 2), 4)}`;
      return <Tag><InlineHtml html={data.text} /></Tag>;
    }
    case 'paragraph':
      return <p><InlineHtml html={data.text} /></p>;
    case 'list': {
      const Tag = data.style === 'ordered' ? 'ol' : 'ul';
      return <Tag>{(data.items || []).map((item, index) => <li key={index}><InlineHtml html={itemText(item)} /></li>)}</Tag>;
    }
    case 'checklist':
      return (
        <ul className="editorjs-checklist">
          {(data.items || []).map((item, index) => (
            <li key={index}>
              <input type="checkbox" checked={Boolean(item.checked)} readOnly />
              <InlineHtml html={item.text || ''} />
            </li>
          ))}
        </ul>
      );
    case 'quote':
      return <blockquote><p><InlineHtml html={data.text} /></p>{data.caption && <cite><InlineHtml html={data.caption} /></cite>}</blockquote>;
    case 'warning':
      return <aside className="editorjs-warning"><strong>{data.title}</strong><p>{data.message}</p></aside>;
    case 'delimiter':
      return <hr />;
    case 'code':
      return <pre><code>{data.code || ''}</code></pre>;
    case 'table':
      return <Table data={data} />;
    case 'image':
      return (
        <figure className={imageClassName(data, block.tunes)}>
          <img src={data.file?.url} alt={data.caption || ''} />
          {data.caption && <figcaption><InlineHtml html={data.caption} /></figcaption>}
        </figure>
      );
    case 'embed':
      return data.embed ? <div className="editorjs-embed"><iframe src={data.embed} title={data.caption || 'Embedded media'} allowFullScreen /></div> : null;
    case 'raw':
      return <div dangerouslySetInnerHTML={{ __html: data.html || '' }} />;
    default:
      return null;
  }
}

function imageClassName(data, tunes = {}) {
  const layout = tunes.imageLayout || data.imageLayout || data.tunes?.imageLayout || {};
  const classes = [
    `editorjs-image-align-${layout.alignment || 'center'}`,
    `editorjs-image-size-${layout.width || (data.stretched ? 'full' : 'medium')}`,
  ];

  if (data.withBorder) classes.push('editorjs-image-with-border');
  if (data.withBackground) classes.push('editorjs-image-with-background');
  return classes.join(' ');
}

function itemText(item) {
  return typeof item === 'string' ? item : item?.content || item?.text || '';
}

function Table({ data }) {
  return (
    <div className="editorjs-table-wrap">
      <table>
        <tbody>
          {(data.content || []).map((row, rowIndex) => (
            <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><InlineHtml html={cell} /></td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
