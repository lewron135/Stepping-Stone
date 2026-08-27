import React from 'react';
import { rupiah } from '../../utils/format';

interface TransactionBreakdownProps {
  price: number;
  adminFee: number;
}

export function TransactionBreakdown({ price, adminFee }: TransactionBreakdownProps) {
  return (
    <dl className="divide-y divide-line border border-line">
      <div className="flex items-baseline justify-between gap-4 px-4 py-3">
        <dt className="text-[13px] text-muted">Harga pekerjaan</dt>
        <dd className="text-[14px] font-semibold tabular-nums text-ink">{rupiah(price)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 px-4 py-3">
        <dt className="text-[13px] text-muted">Biaya admin</dt>
        <dd className="text-[14px] font-semibold tabular-nums text-ink">{rupiah(adminFee)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 bg-subtle px-4 py-3">
        <dt className="text-[13px] font-semibold text-ink">Total</dt>
        <dd className="text-[16px] font-bold tabular-nums tracking-tight text-ink">
          {rupiah(price + adminFee)}
        </dd>
      </div>
      <p className="px-4 py-2.5 text-[11.5px] leading-relaxed text-faint">
        Rincian ini hanya catatan kesepakatan. Pembayaran dilakukan langsung antara klien dan
        pekerja, di luar aplikasi.
      </p>
    </dl>);

}