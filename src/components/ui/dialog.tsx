import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode, TouchEvent as ReactTouchEvent } from 'react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogContent({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  const { t } = useTranslation()
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startYRef = useRef(0)

  const handleTouchStart = (e: ReactTouchEvent) => {
    // 只有从顶部拖拽区域开始才允许下拉关闭
    const target = e.target as HTMLElement
    const dragHandle = target.closest('[data-drag-handle]')
    if (!dragHandle && !target.closest('.dialog-header')) return
    startYRef.current = e.touches[0].clientY
    setIsDragging(true)
  }

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!isDragging) return
    const deltaY = e.touches[0].clientY - startYRef.current
    if (deltaY > 0) {
      setDragY(Math.min(deltaY, 200))
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragY > 80) {
      // 触发关闭
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)
    } else {
      setDragY(0)
    }
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-charcoal-900/40 backdrop-blur-sm data-[state=open]:animate-rise"
        style={{ opacity: isDragging ? Math.max(0, 1 - dragY / 200) : 1 }}
      />
      <DialogPrimitive.Content
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl bg-rice-50 shadow-float focus:outline-none md:bottom-auto md:left-1/2 md:right-auto md:top-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl',
          className
        )}
        style={{
          transform: isDragging ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 250ms ease',
        }}
      >
        {/* 移动端下拉手柄 */}
        <div className="flex justify-center pt-3 md:hidden" data-drag-handle>
          <div className="h-1.5 w-10 rounded-full bg-charcoal-900/20" />
        </div>
        <div className="dialog-header relative flex-shrink-0 px-5 pt-3 md:px-6 md:pt-6">
          {title && <DialogPrimitive.Title className="pr-10 text-xl font-bold text-charcoal-900">{title}</DialogPrimitive.Title>}
          <DialogPrimitive.Close className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-charcoal-500 shadow-sm transition hover:text-chili-500 active:scale-95" aria-label={t("common.aria_close")}>
            <X size={18} />
          </DialogPrimitive.Close>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5 md:px-6 md:pb-6 scroll-container">
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
