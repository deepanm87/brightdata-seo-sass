"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import { Globe } from "lucide-react"
import { SeoReport } from "@/lib/seo-schema"

interface SourceDistributionChart {
  seoReport: SeoReport
}

export function SourceDistributionChart({
  seoReport
}: SourceDistributionChartProps) {
  const sourceTypeEntries = (() => {
    const st = seoReport?.inventory?.source_types as
      | Record<string, Array<unknown>>
      | undefined

      if (!st) return [] as Array<{ name: string; value: number; color: string }>

      const palette = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4",
        "#22c55e",
        "#a855f7",
        "#f97316",
      ]

      return Object.entries(st)
        .filter(([, arr], idx) => ({
          name,
          value: (arr as Array<unknown>).length,
          color: palette[idx % palette.length]
        }))
  })()

  if (sourceTypeEntries.length === 0) {
    return null
  }

  return (
    <Card className="xl:col-span-2 border bg-gradient-to-br from-card to-card/95">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Source Types Distribution</CardTitle>
            <CardDescription className="text-base">
              Breakdown of data sources by type and volume
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <ChartContainer
            config={Object.fromEntries(
              sourceTypeEntries.map(e => [
                e.name,
                { 
                  label: e.name,
                  color: e.color
                }
              ])
            )}
            className="h-[350px] w-full"
          >
            <PieChart>
              <Pie
                data={sourceTypeEntries}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={8}
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {sourceTypeEntries.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <div className="space-y-4">
            <h4 className="font-semibold text-lg mb-4">Source Breakdown</h4>
            {sourceTypeEntries.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: entry.color}}
                  />
                  <span className="font-medium capitalize">
                    {entry.name.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{entry.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(
                      (entry.value / 
                        sourceTypeEntries.reduce( 
                          (sum, e) => sum + e.value,
                          0
                        )) * 
                        100
                    )}
                    %
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}