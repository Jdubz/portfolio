import React from "react"
import { Grid, Box, Text } from "theme-ui"

interface DataGridItem {
  label: string
  value: string | number | React.ReactNode
}

interface DataGridProps {
  items: DataGridItem[]
  columns?: number[]
}

/**
 * Data Grid component
 *
 * Displays key-value pairs in a grid layout
 *
 * @example
 * ```tsx
 * <DataGrid
 *   columns={[1, 2, 4]}
 *   items={[
 *     { label: "Company", value: "Acme Corp" },
 *     { label: "Location", value: "San Francisco, CA" },
 *     { label: "Status", value: <StatusBadge status="active" /> },
 *   ]}
 * />
 * ```
 */
export const DataGrid: React.FC<DataGridProps> = ({ items, columns = [1, 2] }) => (
  <Grid columns={columns} gap={3}>
    {items.map((item, i) => (
      <DataGridItem key={i} label={item.label} value={item.value} />
    ))}
  </Grid>
)

interface DataGridItemProps {
  label: string
  value: string | number | React.ReactNode
}

/**
 * Data Grid Item component
 *
 * Single key-value display
 */
export const DataGridItem: React.FC<DataGridItemProps> = ({ label, value }) => (
  <Box>
    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1, textTransform: "uppercase", fontWeight: "medium" }}>
      {label}
    </Text>
    <Text sx={{ fontSize: 2, fontWeight: "medium" }}>{value}</Text>
  </Box>
)
