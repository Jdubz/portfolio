import React from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Box } from "theme-ui"
import { BlurbEntry } from "./BlurbEntry"
import type { BlurbEntry as BlurbEntryType, UpdateBlurbData } from "../types/experience"

interface DraggableBlurbListProps {
  blurbs: BlurbEntryType[]
  isEditor: boolean
  onUpdate: (name: string, data: UpdateBlurbData) => Promise<void>
  onCreate: (name: string, title: string, content: string) => Promise<void>
  onReorder: (blurbs: BlurbEntryType[]) => Promise<void>
}

interface SortableBlurbProps {
  blurb: BlurbEntryType
  isEditor: boolean
  onUpdate: (name: string, data: UpdateBlurbData) => Promise<void>
  onCreate: (name: string, title: string, content: string) => Promise<void>
}

const SortableBlurb: React.FC<SortableBlurbProps> = ({ blurb, isEditor, onUpdate, onCreate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: blurb.id })

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
          {blurb.order !== undefined && (
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
              Order: {blurb.order}
            </Box>
          )}
        </Box>
      )}
      <BlurbEntry name={blurb.name} blurb={blurb} isEditor={isEditor} onUpdate={onUpdate} onCreate={onCreate} />
    </Box>
  )
}

export const DraggableBlurbList: React.FC<DraggableBlurbListProps> = ({
  blurbs,
  isEditor,
  onUpdate,
  onCreate,
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
      const oldIndex = blurbs.findIndex((blurb) => blurb.id === String(active.id))
      const newIndex = blurbs.findIndex((blurb) => blurb.id === String(over.id))

      const reorderedBlurbs = arrayMove(blurbs, oldIndex, newIndex)

      // Update order field for all blurbs
      const blurbsWithNewOrder = reorderedBlurbs.map((blurb, index) => ({
        ...blurb,
        order: index + 1,
      }))

      void onReorder(blurbsWithNewOrder)
    }
  }

  if (!isEditor) {
    // Non-editors see regular list without drag handles
    return (
      <Box>
        {blurbs.map((blurb) => (
          <BlurbEntry
            key={blurb.name}
            name={blurb.name}
            blurb={blurb}
            isEditor={false}
            onUpdate={onUpdate}
            onCreate={onCreate}
          />
        ))}
      </Box>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blurbs.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        {blurbs.map((blurb) => (
          <SortableBlurb key={blurb.id} blurb={blurb} isEditor={isEditor} onUpdate={onUpdate} onCreate={onCreate} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
