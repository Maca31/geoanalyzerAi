import { Card, CardContent } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export function StatsCard({ icon: Icon, label, value, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold mt-0.5">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
