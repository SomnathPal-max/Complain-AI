interface Props {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}
const tones: Record<string, string> = {
  'Under Review': 'blue',
  Assigned: 'blue',
  'In Progress': 'blue',
  Resolved: 'green',
  Rejected: 'red',
  Reopened: 'amber',
};
export function StatusBadge({ status }: Props) {
  return (
    <span className={`status-badge badge-${tones[status] || 'neutral'}`}>
      {status}
    </span>
  );
}
