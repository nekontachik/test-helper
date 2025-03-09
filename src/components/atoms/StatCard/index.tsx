import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: ReactNode;
  emptyState?: boolean;
}

/**
 * A card component for displaying statistics with an icon
 */
export function StatCard({ title, value, subtext, icon, emptyState = false }: StatCardProps): JSX.Element {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`${emptyState ? 'text-gray-300' : 'text-muted-foreground'}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {emptyState ? (
          <>
            <div className="text-3xl font-bold text-gray-300">{value}</div>
            <p className="text-xs text-gray-300 mt-1">No data available</p>
          </>
        ) : (
          <>
            <div className="text-3xl font-bold">{value}</div>
            {subtext && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtext}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 