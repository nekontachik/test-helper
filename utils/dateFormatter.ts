export function formatDate(
  date: Date,
  locale: string = 'en-GB',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}
