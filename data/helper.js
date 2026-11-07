// Kleine helpers zodat de databestanden compact en leesbaar blijven.
export function step(title, text, code) {
  return { title, text, code };
}

export function idea(id, title, emoji, category, level, time, summary, description, learn, steps, tips = [], next = []) {
  return { id, title, emoji, category, level, time, summary, description, learn, steps, tips, next };
}
