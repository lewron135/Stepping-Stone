import type { AgreementStatus } from '../types';

export const STATUS_LABEL: Record<AgreementStatus, string> = {
  'waiting-approval': 'Menunggu Persetujuan',
  locked: 'Terkunci',
  'in-progress': 'Sedang Dikerjakan',
  'waiting-confirmation': 'Menunggu Konfirmasi',
  completed: 'Selesai',
  'completed-unconfirmed': 'Selesai (Belum Dikonfirmasi)',
  cancelled: 'Batal'
};

/** Grayscale-only weights: solid = terminal/locked, outline = pending, dashed = unresolved. */
export const STATUS_TONE: Record<AgreementStatus, 'solid' | 'outline' | 'muted' | 'dashed'> = {
  'waiting-approval': 'outline',
  locked: 'solid',
  'in-progress': 'outline',
  'waiting-confirmation': 'dashed',
  completed: 'solid',
  'completed-unconfirmed': 'dashed',
  cancelled: 'muted'
};

export const AGREEMENT_STEPS: {status: AgreementStatus;label: string;}[] = [
{ status: 'waiting-approval', label: 'Persetujuan' },
{ status: 'locked', label: 'Terkunci' },
{ status: 'in-progress', label: 'Dikerjakan' },
{ status: 'waiting-confirmation', label: 'Konfirmasi' },
{ status: 'completed', label: 'Selesai' }];


export function stepIndex(status: AgreementStatus): number {
  if (status === 'completed-unconfirmed') return 4;
  if (status === 'cancelled') return -1;
  return AGREEMENT_STEPS.findIndex((step) => step.status === status);
}