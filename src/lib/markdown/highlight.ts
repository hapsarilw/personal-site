import { escapeText } from './escape';

type LanguageSpec = {
  keywords: string;
  /** Regex source (not a RegExp) so it can be composed into the scanner below. */
  comment: string;
};

const LANGUAGES: Record<string, LanguageSpec> = {
  ts: {
    keywords:
      'const|let|var|function|return|async|await|if|else|for|of|in|while|switch|case|break|new|class|extends|implements|import|export|from|default|type|interface|typeof|null|undefined|true|false|try|catch|finally|throw',
    comment: '//[^\\n]*',
  },
  py: {
    keywords:
      'def|class|return|import|from|as|with|for|in|if|elif|else|while|try|except|finally|yield|lambda|None|True|False|and|or|not|async|await|pass|raise',
    comment: '#[^\\n]*',
  },
  sql: {
    keywords:
      'CREATE|INDEX|CONCURRENTLY|ON|SELECT|FROM|WHERE|INSERT|INTO|UPDATE|SET|DELETE|JOIN|GROUP|ORDER|BY|DESC|ASC|LIMIT|VALUES|TABLE|PRIMARY|KEY|NOT|NULL|VARCHAR|INT|DATE',
    comment: '--[^\\n]*',
  },
};

const ALIASES: Record<string, string> = {
  js: 'ts',
  jsx: 'ts',
  tsx: 'ts',
  javascript: 'ts',
  typescript: 'ts',
  python: 'py',
};

/** String literals, written without backreferences so they compose into one alternation. */
const STRING = String.raw`"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|` + '`(?:\\\\.|[^`\\\\])*`';

/** Checked in order  the first group that matched wins. */
const TOKEN_NAMES = ['comment', 'string', 'keyword', 'number', 'fn'] as const;

function resolveLanguage(language: string): LanguageSpec | undefined {
  const key = language.toLowerCase();
  return LANGUAGES[ALIASES[key] ?? key];
}

function buildScanner(spec: LanguageSpec): RegExp {
  return new RegExp(
    [
      `(?<comment>${spec.comment})`,
      `(?<string>${STRING})`,
      `(?<keyword>\\b(?:${spec.keywords})\\b)`,
      `(?<number>\\b\\d+(?:\\.\\d+)?\\b)`,
      `(?<fn>\\b[A-Za-z_$][\\w$]*(?=\\())`,
    ].join('|'),
    'g',
  );
}

/**
 * Highlights code in a single left-to-right pass.
 *
 * One alternation means every character is consumed exactly once, so a later
 * rule can never match inside markup an earlier rule produced  the failure mode
 * of the multi-pass approach this replaced, where the digits of a placeholder
 * were themselves highlighted as numbers.
 *
 * Fences with no language (ASCII diagrams, shell output) are escaped only:
 * highlighting prose as if it were code reads worse than not highlighting it.
 */
export function highlight(code: string, language: string): string {
  const spec = resolveLanguage(language);
  const escaped = escapeText(code);
  if (!spec) return escaped;

  return escaped.replace(buildScanner(spec), (match, ...args) => {
    const groups = args.at(-1) as Record<string, string | undefined> | undefined;
    if (!groups) return match;

    const name = TOKEN_NAMES.find((token) => groups[token] !== undefined);
    return name ? `<span class="tok-${name}">${match}</span>` : match;
  });
}
