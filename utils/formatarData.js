const dois = (n) => String(n).padStart(2, '0');

// "2026-11-20T14:30:00.000Z" (ISO) -> "20/11/2026 às 11:30" (horário local)
export function formatarLembrete(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} às ${dois(
    d.getHours()
  )}:${dois(d.getMinutes())}`;
}
