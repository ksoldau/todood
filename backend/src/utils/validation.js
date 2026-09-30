export function isValidEmail(email) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/;
  return emailRegex.test(email);
}

export function isRealDate(formattedDate /* YYYY-MM-DD */) {
  if (typeof formattedDate !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) return false;
  const d = new Date(formattedDate + 'T00:00:00Z');
  return (
    !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === formattedDate
  );
}
