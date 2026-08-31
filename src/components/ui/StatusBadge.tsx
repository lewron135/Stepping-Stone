import { LockIcon } from 'lucide-react';
import type { AgreementStatus } from '../../types';
import { STATUS_LABEL, STATUS_TONE } from '../../utils/status';
import { Badge } from './Badge';

export function StatusBadge({ status }: {status: AgreementStatus;}) {
  return (
    <Badge
      tone={STATUS_TONE[status]}
      icon={status === 'locked' ? <LockIcon className="h-3 w-3" aria-hidden /> : undefined}>
      
      {STATUS_LABEL[status]}
    </Badge>);

}