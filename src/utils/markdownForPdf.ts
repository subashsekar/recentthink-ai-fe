export type PdfTextStyle =
  'cover' | 'section' | 'subtitle' | 'meta' | 'heading' | 'subheading' | 'body' | 'code' | 'bullet';

export interface PdfTextLine {
  text: string;
  style: PdfTextStyle;
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1 ($2)')
    .trim();
}

export function markdownToPdfLines(markdown: string): PdfTextLine[] {
  const lines: PdfTextLine[] = [];
  const source = markdown.replace(/\r\n/g, '\n').trim();
  if (!source) return lines;

  let inCodeBlock = false;
  const codeBuffer: string[] = [];

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        if (codeBuffer.length > 0) {
          lines.push({ text: codeBuffer.join('\n'), style: 'code' });
          codeBuffer.length = 0;
        }
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (!line.trim() || line.trim() === '---') {
      lines.push({ text: '', style: 'body' });
      continue;
    }

    if (line.startsWith('### ')) {
      lines.push({ text: stripInlineMarkdown(line.slice(4)), style: 'subheading' });
      continue;
    }

    if (line.startsWith('## ')) {
      lines.push({ text: stripInlineMarkdown(line.slice(3)), style: 'heading' });
      continue;
    }

    if (line.startsWith('# ')) {
      lines.push({ text: stripInlineMarkdown(line.slice(2)), style: 'heading' });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      lines.push({
        text: `• ${stripInlineMarkdown(line.replace(/^[-*]\s+/, ''))}`,
        style: 'bullet',
      });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      lines.push({ text: stripInlineMarkdown(line), style: 'bullet' });
      continue;
    }

    if (/^\*\*.+\*\*:?$/.test(line.trim())) {
      lines.push({ text: stripInlineMarkdown(line), style: 'subheading' });
      continue;
    }

    lines.push({ text: stripInlineMarkdown(line), style: 'body' });
  }

  if (codeBuffer.length > 0) {
    lines.push({ text: codeBuffer.join('\n'), style: 'code' });
  }

  return lines;
}

export function htmlToPlainText(html: string): string {
  if (typeof document === 'undefined') return html;
  const node = document.createElement('div');
  node.innerHTML = html;
  return (node.textContent ?? node.innerText ?? '').trim();
}

function plainTextToStructuredLines(plain: string): PdfTextLine[] {
  const normalized = plain.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    const lines: PdfTextLine[] = [];
    for (const paragraph of paragraphs) {
      const singleLine = paragraph.replace(/\n+/g, ' ').trim();
      if (/^example\s+\d+:/i.test(singleLine)) {
        lines.push({ text: singleLine.replace(/:$/, ''), style: 'subheading' });
        continue;
      }
      if (/^(input|output|explanation|constraints):/i.test(singleLine)) {
        lines.push({ text: singleLine, style: 'subheading' });
        continue;
      }
      lines.push({ text: singleLine, style: 'body' });
    }
    return lines;
  }

  return normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ text: line, style: 'body' as const }));
}

export function contentToPdfLines(input: {
  markdown?: string;
  html?: string;
  plain?: string;
}): PdfTextLine[] {
  const markdown = input.markdown?.trim();
  if (markdown) return markdownToPdfLines(markdown);

  const html = input.html?.trim();
  if (html) {
    const plain = htmlToPlainText(html);
    return plainTextToStructuredLines(plain);
  }

  const plain = input.plain?.trim();
  if (!plain) return [];

  return plainTextToStructuredLines(plain);
}
