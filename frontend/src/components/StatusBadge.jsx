import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();
  let badgeClass = 'badge';

  if (['COMPLETED', 'PASSED', 'DELIVERED', 'ACTIVE', 'PAID', 'AVAILABLE'].includes(normalized)) {
    badgeClass = 'badge badge-filled';
  } else if (['FAILED', 'CANCELLED', 'REJECTED', 'CRITICAL', 'INACTIVE'].includes(normalized)) {
    badgeClass = 'badge badge-gray';
  } else {
    badgeClass = 'badge';
  }

  return (
    <span className={badgeClass}>
      {normalized.replace(/_/g, ' ')}
    </span>
  );
}
