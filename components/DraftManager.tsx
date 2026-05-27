'use client'

import { Draft } from '@/app/page'

type Props = {
  drafts: Draft[]
  activeDraft: Draft | null
  onSelect: (d: Draft) => void
  onNew: () => void
  onDelete: (id: number) => void
}

export default function DraftManager({ drafts, activeDraft, onSelect, onNew, onDelete }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
        <span className="section-label mb-0">Drafts</span>
        <button onClick={onNew} className="btn-primary py-1 px-2 text-xs">+ New</button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {drafts.length === 0 && (
          <p className="text-xs text-gray-400 px-3 py-4 text-center">No drafts yet</p>
        )}
        {drafts.map(d => (
          <div
            key={d.id}
            onClick={() => onSelect(d)}
            className={`group flex items-start justify-between px-3 py-2.5 cursor-pointer rounded-lg mx-1 my-0.5 transition-colors
              ${activeDraft?.id === d.id ? 'bg-vbn-green-light' : 'hover:bg-gray-50'}`}
          >
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${activeDraft?.id === d.id ? 'text-vbn-green' : 'text-gray-800'}`}>
                {d.title || 'Untitled'}
              </p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                {d.body ? d.body.substring(0, 50) + (d.body.length > 50 ? '…' : '') : 'Empty'}
              </p>
              <p className="text-[10px] text-gray-300 mt-0.5">
                {new Date(d.updated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(d.id) }}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 ml-2 flex-shrink-0 transition-opacity mt-0.5"
              title="Delete draft"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
