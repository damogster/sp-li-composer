'use client'

import { useState, useEffect, useRef } from 'react'

type Contact = {
  id: string | number
  hs_id?: string
  name: string
  org: string
  job_title: string
  type: string
  pinned?: boolean
}

type Props = {
  onInsert: (name: string) => void
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function ContactSearch({ onInsert }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Contact[]>([])
  const [pinned, setPinned] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState<string>('')
  const [showAddManual, setShowAddManual] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualOrg, setManualOrg] = useState('')
  const timer = useRef<NodeJS.Timeout>()

  useEffect(() => { loadPinned() }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    if (query.trim().length < 2) { setResults([]); setSource(''); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/contacts/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results ?? [])
        setSource(data.source ?? '')
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 350)
  }, [query])

  async function loadPinned() {
    const res = await fetch('/api/contacts/pin')
    const data = await res.json()
    setPinned(data)
  }

  async function pinContact(c: Contact) {
    await fetch('/api/contacts/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hs_id: c.hs_id ?? String(c.id), name: c.name, org: c.org, job_title: c.job_title }),
    })
    loadPinned()
  }

  async function unpinContact(id: number) {
    await fetch(`/api/contacts/pin?id=${id}`, { method: 'DELETE' })
    loadPinned()
  }

  async function addManual() {
    if (!manualName.trim()) return
    await fetch('/api/contacts/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: manualName.trim(), org: manualOrg.trim(), type: 'person' }),
    })
    setManualName(''); setManualOrg(''); setShowAddManual(false)
    loadPinned()
  }

  const displayResults = query.trim().length >= 2 ? results : []

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="6.5" cy="6.5" r="4.5"/><path d="m10.5 10.5 3 3"/>
        </svg>
        <input
          className="input pl-8 text-xs"
          placeholder="Search 1,163 HubSpot contacts..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Search results */}
      {displayResults.length > 0 && (
        <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
          <p className="section-label mb-1">
            Results {source === 'cache' && <span className="text-yellow-500">(cached)</span>}
          </p>
          {displayResults.map(c => (
            <ContactRow
              key={c.id}
              contact={c}
              onInsert={() => onInsert(c.name)}
              onPin={() => pinContact(c)}
              showPin
            />
          ))}
        </div>
      )}

      {loading && <p className="text-xs text-gray-400 text-center py-2">Searching HubSpot...</p>}

      {/* Pinned contacts */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="section-label mb-0">Pinned</span>
          <button onClick={() => setShowAddManual(o => !o)} className="text-[10px] text-vbn-green hover:underline">
            + Add manual
          </button>
        </div>

        {showAddManual && (
          <div className="flex flex-col gap-1.5 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <input className="input text-xs py-1" placeholder="Full name" value={manualName} onChange={e => setManualName(e.target.value)} />
            <input className="input text-xs py-1" placeholder="Company / role" value={manualOrg} onChange={e => setManualOrg(e.target.value)} />
            <div className="flex gap-1.5">
              <button onClick={addManual} className="btn-primary text-xs py-1 flex-1">Add & pin</button>
              <button onClick={() => setShowAddManual(false)} className="btn-secondary text-xs py-1">Cancel</button>
            </div>
          </div>
        )}

        {pinned.length === 0 && !showAddManual && (
          <p className="text-xs text-gray-400 text-center py-3">
            Search a contact and pin them for quick access
          </p>
        )}

        {pinned.map((c: any) => (
          <ContactRow
            key={c.id}
            contact={c}
            onInsert={() => onInsert(c.name)}
            onUnpin={() => unpinContact(c.id)}
            showUnpin
          />
        ))}
      </div>
    </div>
  )
}

function ContactRow({
  contact, onInsert, onPin, onUnpin, showPin, showUnpin
}: {
  contact: Contact
  onInsert: () => void
  onPin?: () => void
  onUnpin?: () => void
  showPin?: boolean
  showUnpin?: boolean
}) {
  return (
    <div className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={onInsert}>
      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-700 text-[9px] font-semibold">
        {getInitials(contact.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{contact.name}</p>
        {contact.org && <p className="text-[10px] text-gray-400 truncate">{contact.org}</p>}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
        {showPin && onPin && (
          <button onClick={e => { e.stopPropagation(); onPin() }} className="text-gray-300 hover:text-vbn-green" title="Pin">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/></svg>
          </button>
        )}
        {showUnpin && onUnpin && (
          <button onClick={e => { e.stopPropagation(); onUnpin() }} className="text-gray-300 hover:text-red-400" title="Unpin">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3l10 10M13 3 3 13"/></svg>
          </button>
        )}
        <span className="text-[9px] text-vbn-green font-medium">@insert</span>
      </div>
    </div>
  )
}
