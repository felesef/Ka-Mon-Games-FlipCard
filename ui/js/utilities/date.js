export function formatScoreboardDate(isoString) {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return isNaN(d.getTime())
      ? isoString
      : d.toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short",
        });
  } catch (_) {
    return isoString;
  }
}
