export function parseDateTime(value: string) {
  const [datePart, timePart] = value.split(' ')
  const [day, month, year] = datePart.split('/').map(Number)
  const [hours = 0, minutes = 0] = (timePart ?? '00:00').split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

export function parseDateOnly(value: string) {
  const [day, month, year] = value.split('/').map(Number)
  return new Date(year, month - 1, day)
}

export function isDateInRange(value: string, from?: string, to?: string) {
  const target = parseDateOnly(value)
  const fromMatched = !from || target >= parseDateOnly(from)
  const toMatched = !to || target <= parseDateOnly(to)
  return fromMatched && toMatched
}
