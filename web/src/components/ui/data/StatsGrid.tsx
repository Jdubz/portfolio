import React from "react"
import { Grid, Box, Text } from "theme-ui"

interface StatCardProps {
  label: string
  value: string | number
  color?: string
  icon?: React.ReactNode
}

interface StatsGridProps {
  stats: StatCardProps[]
  columns?: number[]
}

/**
 * Stats Grid component
 *
 * Displays statistics in a responsive grid
 *
 * @example
 * ```tsx
 * <StatsGrid
 *   columns={[2, 4]}
 *   stats={[
 *     { label: "Total Sources", value: 42 },
 *     { label: "Enabled", value: 38, color: "green" },
 *     { label: "Total Jobs", value: 1250, color: "blue", icon: "📊" },
 *   ]}
 * />
 * ```
 */
export const StatsGrid: React.FC<StatsGridProps> = ({ stats, columns = [2, 4] }) => (
  <Grid columns={columns} gap={3} sx={{ mb: 4 }}>
    {stats.map((stat, i) => (
      <StatCard key={i} {...stat} />
    ))}
  </Grid>
)

/**
 * Stat Card component
 *
 * Single statistic display
 */
export const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon }) => (
  <Box sx={{ variant: "cards.primary", p: 3 }}>
    {icon && <Box sx={{ mb: 2, fontSize: 4 }}>{icon}</Box>}
    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1, textTransform: "uppercase", fontWeight: "medium" }}>
      {label}
    </Text>
    <Text sx={{ fontSize: 4, fontWeight: "bold", color }}>{value}</Text>
  </Box>
)
