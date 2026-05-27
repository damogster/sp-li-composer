'use client'

import { useEffect, useState } from 'react'
import Composer from '@/components/Composer'
import DraftManager from '@/components/DraftManager'

export type Draft = {
  id: number
  title: string
  body: string
  first_comment: string
  hashtags: string[]
  updated_at: string
}

export default function Home() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [activeDraft, setActiveDraft] = useState<Draft | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { loadDrafts() }, [])

  async function loadDrafts() {
    const res = await fetch('/api/drafts')
    const data = await res.json()
    setDrafts(data)
    if (data.length > 0 && !activeDraft) setActiveDraft(data[0])
  }

  async function newDraft() {
    const res = await fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New post', body: '', first_comment: '', hashtags: [] }),
    })
    const draft = await res.json()
    setDrafts(prev => [draft, ...prev])
    setActiveDraft(draft)
  }

  async function saveDraft(updates: Partial<Draft>) {
    if (!activeDraft) return
    const res = await fetch(`/api/drafts/${activeDraft.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const updated = await res.json()
    setActiveDraft(updated)
    setDrafts(prev => prev.map(d => d.id === updated.id ? updated : d))
  }

  async function deleteDraft(id: number) {
    await fetch(`/api/drafts/${id}`, { method: 'DELETE' })
    const remaining = drafts.filter(d => d.id !== id)
    setDrafts(remaining)
    if (activeDraft?.id === id) setActiveDraft(remaining[0] ?? null)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — draft manager */}
      <div className={`flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-200 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <DraftManager
          drafts={drafts}
          activeDraft={activeDraft}
          onSelect={setActiveDraft}
          onNew={newDraft}
          onDelete={deleteDraft}
        />
      </div>

      {/* Main composer */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="btn-ghost p-1.5 rounded"
            title="Toggle drafts"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12M2 8h12M2 12h12"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-vbn-green flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">VBN</span>
            </div>
            <span className="text-sm font-medium text-gray-700">LinkedIn Composer</span>
          </div>
          {activeDraft && (
            <span className="text-xs text-gray-400 ml-auto">
              Saved {new Date(activeDraft.updated_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Composer area */}
        <div className="flex-1 overflow-auto p-4">
          {activeDraft ? (
            <Composer
              key={activeDraft.id}
              draft={activeDraft}
              onSave={saveDraft}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <p className="text-sm">No draft selected</p>
              <button onClick={newDraft} className="btn-primary text-sm">New post</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
