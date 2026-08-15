export function getKPIColor(value, greenThreshold = 90, yellowThreshold = 75) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }
  if (value >= greenThreshold) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-400';
  }
  if (value >= yellowThreshold) {
    return 'bg-amber-100 text-amber-800 border-amber-400';
  }
  return 'bg-rose-100 text-rose-800 border-rose-400';
}