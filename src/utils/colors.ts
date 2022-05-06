export function getPlayerColor(player: number, alpha: number): string {
  const rgb = player === 0 ? [34, 139, 230] : [240, 62, 62];
  return `rgba(${rgb.join(', ')}, ${alpha})`;
}
