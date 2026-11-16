interface Props {
  priority: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
const tones: Record<string, string> = {
  Critical: 'red',
  High: 'amber',
  Medium: 'blue',
  Low: 'neutral',
};
export function PriorityBadge({ priority }: Props) {
  const name =
    priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  return (
    <span className={`priority-badge badge-${tones[name] || 'neutral'}`}>
      {name}
    </span>
  );
}
