import { TrendingDown, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StatsCard = ({ title, value, change, icon, trend, color }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div
          className={`mt-1 flex items-center text-xs ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}
        >
          {trend === 'up' && <TrendingUp className="mr-1 h-3 w-3" />}
          {trend === 'down' && <TrendingDown className="mr-1 h-3 w-3" />}
          {change}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
