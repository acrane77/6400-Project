'use client'
import { useState } from "react"
import { EVENT_CATEGORIES } from '@/features/events/data/models/categories'
import { CalendarHeart, HandHelping, GraduationCap, Dices, BriefcaseBusiness, Menu } from 'lucide-react'

const categoryIcons = {
  b1000: CalendarHeart,
  b2000: HandHelping,
  b3000: GraduationCap,
  b4000: Dices,
  b5000: BriefcaseBusiness,
} as const

const itemHoverAnimation = "transition-colors hover:bg-muted"
export default function CategorySelect({ closeDialog, setSelectedCategory  }: { closeDialog: () => void, setSelectedCategory: (category: string) => void  }) {
      const [expandedCategories, setExpandedCategories] = useState<string[]>([])
    
   return <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog()
          }}
        >
          <section
            aria-labelledby="category-dialog-title"
            aria-modal="true"
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-5 text-foreground shadow-xl"
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold" id="category-dialog-title">Choose a category</h2>
              <button
                className="rounded-md px-3 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                type="button"
                aria-label="Close category picker"
                onClick={() => closeDialog()}
              >✕</button>
            </div>
            <ul className="space-y-2">
              <li key={'b0'} className={`overflow-hidden rounded-lg border border-border ${itemHoverAnimation}`}>
                <div className="flex items-center bg-background">
                  <button
                      key={'b0'}
                      className={`block w-full rounded-md px-3 py-3 text-left ${itemHoverAnimation}`}
                      type="button"
                      onClick={() => {
                        setSelectedCategory('')
                        closeDialog()
                      }} >
                      <span className="flex items-center gap-3">
                        <Menu aria-hidden="true" className="size-5 text-primary" />
                        All Events
                      </span>
                  </button>
                </div>
              </li>
              {EVENT_CATEGORIES.filter((item) => !item.b).map((parent) => {
                const expanded = expandedCategories.includes(parent.id)
                const Icon = categoryIcons[parent.id as keyof typeof categoryIcons]
                return (
                  <li key={parent.id} className={`overflow-hidden rounded-lg border border-border ${itemHoverAnimation}`}>
                    <div className="flex items-center bg-background">
                      <button
                        className="flex flex-1 items-center justify-between gap-3 px-3 py-3 text-left font-medium"
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setExpandedCategories((current) => expanded
                          ? current.filter((id) => id !== parent.id)
                          : [...current, parent.id])}
                      >
                        <span className="flex items-center gap-3">
                          <Icon aria-hidden="true" className="size-5 text-primary" />
                          {parent.name}
                        </span>
                        <span aria-hidden="true" className="text-muted-foreground text-xl font-bold">{expanded ? '−' : '+'}</span>
                      </button>
                    </div>
                    {expanded && (
                      <div className="space-y-1 border-t border-border p-2 pl-12">
                        <button
                          className={`block w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground ${itemHoverAnimation}`}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(parent.id)
                            closeDialog()
                          }}
                        >All {parent.name} events</button>
                        {parent.c?.map((childId) => {
                          const child = EVENT_CATEGORIES.find((item) => item.id === childId)
                          return child ? (
                            <button
                              key={child.id}
                              className={`block w-full rounded-md px-3 py-2 text-left ${itemHoverAnimation}`}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(child.id)
                                closeDialog()
                              }}
                            >{child.name}</button>
                          ) : null
                        })}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

}
