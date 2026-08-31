import type { UserStats } from '../../types';

interface TrackRecordStatsProps {
  stats: UserStats;
  compact?: boolean;
}

export function TrackRecordStats({ stats, compact }: TrackRecordStatsProps) {
  const items = [
  { label: 'Selesai', value: stats.completed },
  { label: 'Batal', value: stats.cancelled },
  { label: 'Laporan tidak dibayar', value: stats.unpaidReports }];


  return (
    <dl className="grid grid-cols-3 border border-line">
      {items.map((item, index) =>
      <div
        key={item.label}
        className={index > 0 ? 'border-l border-line px-4 py-3' : 'px-4 py-3'}>
        
          <dd
          className={
          compact ?
          'text-[18px] font-bold tabular-nums tracking-tight text-ink' :
          'text-[26px] font-bold leading-none tabular-nums tracking-tightest text-ink'
          }>
          
            {item.value}
          </dd>
          <dt className="mt-1.5 text-[11.5px] leading-tight text-muted">{item.label}</dt>
        </div>
      )}
    </dl>);

}