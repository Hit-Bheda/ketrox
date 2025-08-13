import { Card, CardContent } from "@/components/ui/card";
import { Building } from "lucide-react";

type StatsProps = {
  stats: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
  };
};

export default function HotelStats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Hotels</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Building className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-[hsl(var(--success))]">{stats.active}</p>
            </div>
            <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trial</p>
              <p className="text-2xl font-bold text-blue-500">{stats.trial}</p>
            </div>
            <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Issues</p>
              <p className="text-2xl font-bold text-[hsl(var(--warning))]">{stats.suspended}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}