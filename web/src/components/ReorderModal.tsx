import React, { useState } from "react"
import { Box, Button, Flex, Heading, Text } from "theme-ui"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface ReorderItem {
  id: string
  title: string
  order: number
}

interface ReorderModalProps {
  isOpen: boolean
  title: string
  items: ReorderItem[]
  onClose: () => void
  onSave: (reorderedItems: ReorderItem[]) => Promise<void>
}

interface SortableItemProps {
  item: ReorderItem
  index: number
}

const SortableItem: React.FC<SortableItemProps> = ({ item, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        p: 3,
        mb: 2,
        bg: isDragging ? "muted" : "background",
        border: "1px solid",
        borderColor: isDragging ? "primary" : "gray",
        borderRadius: 4,
        cursor: "grab",
        "&:active": {
          cursor: "grabbing",
        },
        "&:hover": {
          borderColor: "primary",
          bg: "muted",
        },
      }}
    >
      <Box
        sx={{
          fontSize: 3,
          color: "textMuted",
        }}
      >
        ⋮⋮
      </Box>
      <Box
        sx={{
          flex: 1,
          fontSize: 2,
          fontWeight: "body",
        }}
      >
        {item.title}
      </Box>
      <Box
        sx={{
          bg: "primary",
          color: "background",
          px: 2,
          py: 1,
          borderRadius: 3,
          fontSize: 0,
          fontWeight: "bold",
        }}
      >
        {index + 1}
      </Box>
    </Box>
  )
}

export const ReorderModal: React.FC<ReorderModalProps> = ({ isOpen, title, items, onClose, onSave }) => {
  const [localItems, setLocalItems] = useState(items)
  const [isSaving, setIsSaving] = useState(false)

  // Reinitialize local items when modal opens or items change
  React.useEffect(() => {
    if (isOpen) {
      setLocalItems(items)
    }
  }, [isOpen, items])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === String(active.id))
      const newIndex = localItems.findIndex((item) => item.id === String(over.id))

      const reordered = arrayMove(localItems, oldIndex, newIndex)
      const withNewOrder = reordered.map((item, index) => ({
        ...item,
        order: index + 1,
      }))

      setLocalItems(withNewOrder)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(localItems)
      onClose()
    } catch (error) {
      console.error("Failed to save order:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setLocalItems(items) // Reset to original
    onClose()
  }

  if (!isOpen) return null

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        p: 3,
      }}
      onClick={handleCancel}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          bg: "background",
          borderRadius: 8,
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 4,
            borderBottom: "1px solid",
            borderColor: "gray",
          }}
        >
          <Heading as="h2" sx={{ fontSize: 4, mb: 2 }}>
            {title}
          </Heading>
          <Text sx={{ fontSize: 1, color: "textMuted" }}>Drag items to reorder. Changes save immediately.</Text>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 4,
          }}
        >
          {localItems.length === 0 ? (
            <Text sx={{ textAlign: "center", color: "textMuted", py: 5 }}>No items to reorder</Text>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={localItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                {localItems.map((item, index) => (
                  <SortableItem key={item.id} item={item} index={index} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </Box>

        {/* Footer */}
        <Flex
          sx={{
            p: 4,
            borderTop: "1px solid",
            borderColor: "gray",
            gap: 3,
            justifyContent: "flex-end",
          }}
        >
          <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Order"}
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
