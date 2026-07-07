/**
 * Converts messy scraped problem text (often one token per line) into
 * LeetCode-style Markdown for screen + PDF rendering.
 */
const SECTION_HEADER = /^(Example\s+\d+:|Constraints:|Follow-up:|Follow up:|Note:)/i;
const LABEL_PREFIX = /^(Input:|Output:|Explanation:)\s*(.*)$/i;

function isSectionHeader(line: string): boolean {
  return SECTION_HEADER.test(line);
}

function shouldJoinLines(current: string, next: string): boolean {
  if (!next) return false;
  if (isSectionHeader(next) || LABEL_PREFIX.test(next)) return false;

  const trimmed = current.trim();
  if (!trimmed) return true;

  // New sentence / section after period — usually a new paragraph.
  if (/[.!?]$/.test(trimmed) && /^[A-Z]/.test(next)) return false;

  // Label lines start a new block.
  if (/^(Input|Output|Explanation):/i.test(next)) return false;

  return true;
}

/** Collapse single-token-per-line scraped text into readable paragraphs. */
export function collapseMessyProblemLines(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks: string[] = [];
  let buffer = '';

  for (const line of lines) {
    if (isSectionHeader(line)) {
      if (buffer) {
        blocks.push(buffer.trim());
        buffer = '';
      }
      blocks.push(`@@SECTION@@${line}`);
      continue;
    }

    const labelMatch = line.match(LABEL_PREFIX);
    if (labelMatch) {
      if (buffer) {
        blocks.push(buffer.trim());
        buffer = '';
      }
      blocks.push(`@@LABEL@@${labelMatch[1]}@@VALUE@@${labelMatch[2] ?? ''}`);
      continue;
    }

    if (!buffer) {
      buffer = line;
      continue;
    }

    if (shouldJoinLines(buffer, line)) {
      const needsSpace = !buffer.endsWith('-') && !line.startsWith('(');
      buffer = `${buffer}${needsSpace ? ' ' : ''}${line}`;
    } else {
      blocks.push(buffer.trim());
      buffer = line;
    }
  }

  if (buffer) blocks.push(buffer.trim());
  return blocks;
}

/** Fix broken LeetCode superscripts: "10 4" -> "10^4", "-10 9" -> "-10^9". */
export function fixSuperscripts(text: string): string {
  return text
    .replace(/-\s*10\s+9\b/g, '-10^9')
    .replace(/-\s*10\s+4\b/g, '-10^4')
    .replace(/\b10\s+9\b/g, '10^9')
    .replace(/\b10\s+4\b/g, '10^4');
}

/** Split merged constraint line into individual LeetCode-style bullets. */
export function splitConstraintBullets(text: string): string[] {
  const fixed = fixSuperscripts(text.replace(/^Constraints:\s*/i, '').trim());
  if (!fixed) return [];

  const noteParts = fixed.split(/\s+(?=Only\s+one\b)/i);
  const main = noteParts[0]?.trim() ?? '';
  const notes = noteParts
    .slice(1)
    .map((part) => part.trim())
    .filter(Boolean);

  const rawParts = main
    .split(/\s+(?=-?\d+\s*<=)/)
    .map((part) => part.trim())
    .filter(Boolean);

  return [...rawParts, ...notes];
}

/** Light inline-code detection similar to LeetCode. */
function applyInlineCode(text: string): string {
  const withSuper = fixSuperscripts(text);
  return withSuper
    .replace(/\bi\s+th\s+day\b/gi, 'i-th day')
    .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*\[[^\]]+\])\b/g, '`$1`')
    .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*\.length)\b/g, '`$1`')
    .replace(/\b(prices|nums|target|matrix|grid|head|root|n|m)\b/g, '`$1`');
}

function formatLabelBlock(label: string, value: string): string {
  const normalizedLabel = label.replace(/:$/, '');
  const body = value.trim();
  if (!body) return `**${normalizedLabel}:**`;
  if (/^(Input|Output)$/i.test(normalizedLabel)) {
    return `**${normalizedLabel}:**\n\n\`\`\`\n${fixSuperscripts(body)}\n\`\`\``;
  }
  return `**${normalizedLabel}:** ${applyInlineCode(body)}`;
}

function formatConstraintsList(body: string): string {
  const items = splitConstraintBullets(body);
  if (items.length === 0) return '';
  return items.map((item) => `- ${applyInlineCode(item)}`).join('\n');
}

/**
 * Turn plain scraped problem_statement into structured Markdown.
 * Prefer backend `problem_statement_markdown` when available.
 */
export function plainTextToLeetCodeMarkdown(plain: string): string {
  if (!plain.trim()) return '';

  // Already looks like intentional markdown from backend.
  if (/^#{1,3}\s/m.test(plain) || /```/.test(plain)) {
    return plain;
  }

  const blocks = collapseMessyProblemLines(plain);
  const mdParts: string[] = [];
  let inConstraints = false;

  for (const block of blocks) {
    if (block.startsWith('@@SECTION@@')) {
      const section = block.replace('@@SECTION@@', '').trim();
      if (/^Constraints:/i.test(section)) {
        mdParts.push('### Constraints');
        inConstraints = true;
        continue;
      }
      inConstraints = false;
      mdParts.push(`### ${section.replace(/:$/, '')}`);
      continue;
    }

    if (block.startsWith('@@LABEL@@')) {
      inConstraints = false;
      const [, label, value] = block.match(/@@LABEL@@([^@]+)@@VALUE@@([\s\S]*)/) ?? [];
      if (label) mdParts.push(formatLabelBlock(label, value ?? ''));
      continue;
    }

    if (/^Constraints:/i.test(block)) {
      mdParts.push('### Constraints');
      const list = formatConstraintsList(block);
      if (list) mdParts.push(list);
      inConstraints = false;
      continue;
    }

    if (inConstraints || looksLikeConstraints(block)) {
      const list = formatConstraintsList(block);
      if (list) {
        if (!inConstraints) mdParts.push('### Constraints');
        mdParts.push(list);
        inConstraints = false;
        continue;
      }
    }

    mdParts.push(applyInlineCode(block));
  }

  return mdParts.join('\n\n');
}

function looksLikeConstraints(text: string): boolean {
  const sample = fixSuperscripts(text);
  const inequalityCount = (sample.match(/<=/g) ?? []).length;
  return inequalityCount >= 2 && /\bnums\b|\btarget\b|\bprices\b/i.test(sample);
}
