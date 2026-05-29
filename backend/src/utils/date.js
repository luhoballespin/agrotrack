function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days));
  return d;
}

function diffInDays(a, b) {
  // a - b en días (enteros) usando medianoche local
  const ms = startOfDay(a).getTime() - startOfDay(b).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

module.exports = { addDays, diffInDays, startOfDay };

