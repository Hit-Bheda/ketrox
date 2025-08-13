import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { IconUsers, IconTrendingUp } from "@tabler/icons-react"

const currentData = { staffCount: 0 }; // Replace with actual data source or props
const selectedPeriod = "month"; // Replace with actual value or props
const currentChartData = [{ occupancy: 0 }]; // Replace with actual chart data

const GraphCard = () => {
  return (
    <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Staff Count</CardTitle>
                  <IconUsers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentData.staffCount.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <IconTrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    +5.4% from last {selectedPeriod.slice(0, -2)}
                  </div>
                  <div className="mt-3 h-[60px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentChartData.slice(-4)}>
                        <defs>
                          <linearGradient id="occupancy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="occupancy" 
                          stroke="hsl(var(--secondary))" 
                          fillOpacity={1}
                          fill="url(#occupancy)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
  )
}

export default GraphCard