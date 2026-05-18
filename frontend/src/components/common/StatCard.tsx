import { Card, CardContent } from '@/components/ui/card';

type StatCardProps = {
  label: string;
  value: string;
  note?: string;
};

export function StatCard({ label, value, note }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="text-sm text-slate-400">{label}</div>
        <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
        {note ? <div className="mt-1 text-xs text-slate-500">{note}</div> : null}
      </CardContent>
    </Card>
  );
}