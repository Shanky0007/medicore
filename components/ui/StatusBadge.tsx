import styles from '@/styles/ui.module.css';

const statusMap: Record<string, { label: string; className: string }> = {
  waiting: { label: 'Waiting', className: styles.waiting },
  'in-progress': { label: 'In Progress', className: styles.inProgress },
  'in-consultation': { label: 'In Consultation', className: styles.inProgress },
  done: { label: 'Done', className: styles.done },
  completed: { label: 'Completed', className: styles.done },
  urgent: { label: 'Urgent', className: styles.urgent },
  scheduled: { label: 'Scheduled', className: styles.scheduled },
  confirmed: { label: 'Confirmed', className: styles.confirmed },
  'in-preparation': { label: 'In Preparation', className: styles.inProgress },
  cancelled: { label: 'Cancelled', className: styles.cancelled },
  'no-show': { label: 'No Show', className: styles.cancelled },
  paid: { label: 'Paid', className: styles.paid },
  unpaid: { label: 'Unpaid', className: styles.unpaid },
  'partially-paid': { label: 'Partially Paid', className: styles.partiallyPaid },
  active: { label: 'Active', className: styles.done },
  discharged: { label: 'Discharged', className: styles.waiting },
  requested: { label: 'Requested', className: styles.waiting },
  'sample-collected': { label: 'Sample Collected', className: styles.inProgress },
  validated: { label: 'Validated', className: styles.done },
  archived: { label: 'Archived', className: styles.scheduled },
  'in-stock': { label: 'In Stock', className: styles.done },
  'low-stock': { label: 'Low Stock', className: styles.waiting },
  'out-of-stock': { label: 'Out of Stock', className: styles.urgent },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusMap[status] || { label: status, className: '' };

  return (
    <span className={`${styles.statusBadge} ${config.className}`}>
      {label || config.label}
    </span>
  );
}
