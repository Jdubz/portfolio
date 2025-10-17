import React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Box } from "theme-ui"
import { ExperienceEntry } from "./ExperienceEntry"
import type { ExperienceEntry as ExperienceEntryType, UpdateExperienceData } from "../types/experience"

interface DraggableExperienceListProps {
  entries: ExperienceEntryType[]
  isEditor: boolean
  onUpdate: (id: string, data: UpdateExperienceData) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onReorder: (entries: ExperienceEntryType[]) => Promise<void>
}

interface SortableEntryProps {
  entry: ExperienceEntryType
  isEditor: boolean
  onUpdate: (id: string, data: UpdateExperienceData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const SortableEntry: React.FC<SortableEntryProps> = ({ entry, isEditor, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Box ref={setNodeRef} style={style} {...attributes}>
      {isEditor && (
        <Box
          {...listeners}
          sx={{
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            p: 2,
            bg: "muted",
            borderRadius: 4,
            fontSize: 1,
            fontWeight: "bold",
            color: "textMuted",
          }}
        >
          <span>⋮⋮</span>
          <span>Drag to reorder</span>
          {entry.order !== undefined && (
            <Box
              sx={{
                ml: "auto",
                bg: "primary",
                color: "background",
                px: 2,
                py: 1,
                borderRadius: 3,
                fontSize: 0,
              }}
            >
              Order: {entry.order}
            </Box>
          )}
        </Box>
      )}
      <ExperienceEntry entry={entry} isEditor={isEditor} onUpdate={onUpdate} onDelete={onDelete} />
    </Box>
  )
}

export const DraggableExperienceList: React.FC<DraggableExperienceListProps> = ({
  entries,
  isEditor,
  onUpdate,
  onDelete,
  onReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = entries.findIndex((entry) => entry.id === String(active.id))
      const newIndex = entries.findIndex((entry) => entry.id === String(over.id))

      const reorderedEntries = arrayMove(entries, oldIndex, newIndex)

      // Update order field for all entries
      const entriesWithNewOrder = reorderedEntries.map((entry, index) => ({
        ...entry,
        order: index + 1,
      }))

      void onReorder(entriesWithNewOrder)
    }
  }

  if (!isEditor) {
    // Non-editors see regular list without drag handles
    return (
      <Box>
        {entries.map((entry) => (
          <ExperienceEntry key={entry.id} entry={entry} isEditor={false} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </Box>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        {entries.map((entry) => (
          <SortableEntry key={entry.id} entry={entry} isEditor={isEditor} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
