import type { CommandItemData } from './types';

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

/** Simple fuzzy score: higher is better. Returns 0 for no match. */
export function fuzzyScore(query: string, target: string): number {
  const q = normalize(query);
  const t = normalize(target);
  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 75;

  // Subsequence match (e.g. "binr" → "binary")
  let qi = 0;
  let consecutive = 0;
  let bonus = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      consecutive++;
      bonus += consecutive;
    } else {
      consecutive = 0;
    }
  }
  if (qi === q.length) {
    return Math.min(70, 40 + bonus);
  }

  // Token overlap
  const qTokens = q.split(' ');
  const tTokens = t.split(/[\s,/·\-]+/);
  let hits = 0;
  for (const token of qTokens) {
    if (tTokens.some((tt) => tt.startsWith(token) || tt.includes(token))) hits++;
  }
  if (hits > 0) {
    return Math.round((hits / qTokens.length) * 55);
  }

  return 0;
}

export interface ScoredCommand {
  item: CommandItemData;
  score: number;
}

export function searchCommands(
  query: string,
  catalog: CommandItemData[],
  limit = 40,
): ScoredCommand[] {
  const q = normalize(query);
  if (!q) return [];

  const scored: ScoredCommand[] = [];

  for (const item of catalog) {
    const fields = [
      { value: item.title, weight: 1 },
      { value: item.subtitle ?? '', weight: 0.7 },
      { value: item.badge ?? '', weight: 0.6 },
      { value: item.route ?? '', weight: 0.5 },
      { value: item.category.replace('-', ' '), weight: 0.45 },
      { value: item.keywords.join(' '), weight: 0.85 },
    ];

    let best = 0;
    for (const field of fields) {
      if (!field.value) continue;
      const score = fuzzyScore(q, field.value) * field.weight;
      if (score > best) best = score;
    }

    // Boost when all query tokens appear across combined haystack
    const haystack = normalize(
      [item.title, item.subtitle, item.badge, item.route, item.category, ...item.keywords].join(
        ' ',
      ),
    );
    const tokens = q.split(' ').filter(Boolean);
    const allTokensHit = tokens.every((token) => haystack.includes(token));
    if (allTokensHit && tokens.length > 1) {
      best = Math.max(best, 68);
    }

    if (best >= 35) {
      scored.push({ item, score: best });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit);
}
