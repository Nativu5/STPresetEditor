// Worldbook utility: converters and normalizers (ported from worldbook React app)

/**
 * Convert any plausible input JSON to a normalized worldbook object
 * @param {any} input
 * @param {string} [fallbackName]
 * @returns {{ name: string, entries: any[], extensions: Record<string, unknown> } | null}
 */
export function convertAnyToLorebook(input, fallbackName) {
  // Embedded character_book in a character card
  if (input && input.data && input.data.character_book) {
    const lb = input.data.character_book;
    return normalizeLorebook({
      name: lb.name || fallbackName || '',
      entries: Array.isArray(lb.entries) ? lb.entries : [],
      extensions: lb.extensions || {},
    });
  }

  // Direct Lorebook shape with entries array
  if (input && Array.isArray(input.entries)) {
    return normalizeLorebook({
      name: input.name || fallbackName || '',
      entries: input.entries || [],
      extensions: input.extensions || {},
    });
  }

  // entries as a map object (uid -> entry)
  if (input && input.entries && typeof input.entries === 'object') {
    const rawList = Object.values(input.entries);
    const mapped = rawList.map((it, idx) => {
      const numericPosition = typeof it.position === 'number' ? it.position : undefined;
      const position =
        typeof it.position === 'string'
          ? it.position
          : numericPosition === 0
            ? 'before_char'
            : 'after_char';
      const insertion_order = (() => {
        if (typeof it.insertion_order === 'number') return it.insertion_order;
        if (typeof it.order === 'number') return it.order;
        if (typeof it.displayIndex === 'number') return (it.displayIndex + 1) * 100;
        return (idx + 1) * 100;
      })();
      return {
        id: it.id ?? it.uid ?? Date.now() + idx,
        keys: it.keys ?? it.key ?? [],
        secondary_keys: it.secondary_keys ?? it.keysecondary ?? [],
        comment: it.comment ?? '',
        content: it.content ?? '',
        constant: Boolean(it.constant),
        selective: Boolean(it.selective),
        insertion_order,
        enabled: typeof it.enabled === 'boolean' ? it.enabled : !Boolean(it.disable),
        position,
        extensions: it.extensions || {},
        use_regex: Boolean(it.use_regex),
      };
    });
    return normalizeLorebook({
      name: input.name || fallbackName || '',
      entries: mapped,
      extensions: input.extensions || {},
    });
  }

  return null;
}

/**
 * Normalize worldbook object fields and types
 * @param {{ name: string, entries: any[], extensions?: Record<string, unknown> }} lb
 */
export function normalizeLorebook(lb) {
  const entries = (lb.entries || []).map((e, idx) => ({
    id: e.id ?? Date.now() + idx,
    keys: Array.isArray(e.keys) ? e.keys : [],
    secondary_keys: Array.isArray(e.secondary_keys) ? e.secondary_keys : [],
    comment: typeof e.comment === 'string' ? e.comment : '',
    content: typeof e.content === 'string' ? e.content : '',
    constant: Boolean(e.constant),
    selective: Boolean(e.selective),
    insertion_order: typeof e.insertion_order === 'number' ? e.insertion_order : (idx + 1) * 100,
    enabled: typeof e.enabled === 'boolean' ? e.enabled : true,
    position: (() => {
      const v = e.position;
      return typeof v === 'string' ? v : 'after_char';
    })(),
    use_regex: Boolean(e.use_regex),
    extensions: e.extensions && typeof e.extensions === 'object' ? e.extensions : {},
  }));

  return {
    name: typeof lb.name === 'string' ? lb.name : '',
    entries,
    extensions: lb.extensions && typeof lb.extensions === 'object' ? lb.extensions : {},
  };
}
