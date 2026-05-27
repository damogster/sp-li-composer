'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { toBold, toItalic, toNormal, isBold, isItalic } from '@/lib/unicode'
import ContactSearch from './ContactSearch'
import { Draft } from '@/app/page'

const EmojiPicker = dynamic(() => import('./EmojiPicker'), { ssr: false })

const DEFAULT_HASHTAGS = [
  '#bioenergy', '#biomethane', '#biogas', '#VBN', '#circulareconomy',
  '#renewableenergy', '#sustainableenergy', '#organicwaste', '#SAF',
  '#wastereduction', '#greenenergy', '#netzero', '#victoria',
  '#cleanenergy', '#energytransition',
]

const BULLETS = [
  { label: '• Bullet', value: '•' },
  { label: '▶ Arrow', value: '▶' },
  { label: '✅ Check', value: '✅' },
  { label: '🔹 Point', value: '🔹' },
  { label: '🔥', value: '🔥' },
  { label: '💡', value: '💡' },
]

const HOOKS = [
  'Most people don\'t know this about bioenergy in Victoria...\n\n',
  'The opportunity hiding in plain sight:\n\n',
  'Here\'s what the data is telling us:\n\n',
  'A question I keep hearing from project developers:\n\n',
  'The energy transition conversation keeps missing this:\n\n',
  'We need to talk about organic waste in Australia:\n\n',
]

type Props = {
  draft: Draft
  onSave: (updates: Partial<Draft>) => void
}

export default function Composer({ draft, onSave }: Props) {
  const [body, setBody] = useState(draft.body)
  const [title, setTitle] = useState(draft.title)
  const [firstComment, setFirstComment] = useState(draft.first_comment)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(draft.hashtags))
  const [showEmoji, setShowEmoji] = useState(false)
  const [showContacts, setShowContacts] = useState(true)
  const [tab, setTab] = useState<'compose' | 'preview'>('compose')
  const [copied, setCopied] = useState<'post' | 'comment' | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const saveTimer = useRef<NodeJS.Timeout>()
  const lastCursorRef = useRef<number>(0)

  // Auto-save with debounce
  useEffect(() => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      onSave({ title, body, first_comment: firstComment, hashtags: [...selectedTags] })
    }, 800)
    return () => clearTimeout(saveTimer.current)
  }, [title, body, firstComment, selectedTags])

  const fullPost = body.trim()
    ? body.trim() + (selectedTags.size > 0 ? '\n\n' + [...selectedTags].join(' ') : '')
    : ''
  const charCount = [...fullPost].length

  function applyFormat(type: 'bold' | 'italic') {
    const ta = editorRef.current
    if (!ta) return
    const s = ta.selectionStart, e = ta.selectionEnd
    if (s === e) return
    const selected = ta.value.substring(s, e)
    let replaced: string
    if (type === 'bold') replaced = isBold(selected) ? toNormal(selected) : toBold(selected)
    else replaced = isItalic(selected) ? toNormal(selected) : toItalic(selected)
    const next = ta.value.substring(0, s) + replaced + ta.value.substring(e)
    setBody(next)
    requestAnimationFrame(() => {
      if (!ta) return
      ta.selectionStart = s
      ta.selectionEnd = s + [...replaced].length
      ta.focus()
    })
  }

  function insertAtCursor(text: string) {
    const ta = editorRef.current
    if (!ta) return
    const pos = ta.selectionStart
    const before = ta.value.substring(0, pos)
    const after = ta.value.substring(pos)
    const needsSpace = before.length > 0 && !/\s$/.test(before)
    const insert = (needsSpace ? ' ' : '') + text
    const next = before + insert + after
    setBody(next)
    const newPos = pos + insert.length
    requestAnimationFrame(() => {
      if (!ta) return
      ta.selectionStart = ta.selectionEnd = newPos
      ta.focus()
    })
  }

  function insertBullet(sym: string) {
    const ta = editorRef.current
    if (!ta) return
    const pos = ta.selectionStart
    const before = ta.value.substring(0, pos)
    const after = ta.value.substring(pos)
    const lineContent = before.substring(before.lastIndexOf('\n') + 1)
    const ins = (lineContent.trim() === '' ? '' : '\n') + sym + ' '
    setBody(before + ins + after)
    requestAnimationFrame(() => {
      if (!ta) return
      ta.selectionStart = ta.selectionEnd = pos + ins.length
      ta.focus()
    })
  }

  function insertHook() {
    const hook = HOOKS[Math.floor(Math.random() * HOOKS.length)]
    setBody(hook + body)
    requestAnimationFrame(() => {
      if (!editorRef.current) return
      editorRef.current.selectionStart = editorRef.current.selectionEnd = hook.length
      editorRef.current.focus()
    })
  }

  function insertDivider() {
    insertAtCursor('\n\n――――――――――――――\n\n')
  }

  function insertMention(name: string) {
    insertAtCursor(`@${name}`)
  }

  function onEmojiSelect(emoji: string) {
    insertAtCursor(emoji)
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  async function copyToClipboard(text: string, type: 'post' | 'comment') {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="flex gap-4 h-full max-w-7xl mx-auto">

      {/* Left: editor */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">

        {/* Title */}
        <input
          className="input font-medium text-base"
          placeholder="Post title (for your reference)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => applyFormat('bold')} className="btn-secondary py-1 px-2 text-xs font-bold">B</button>
          <button onClick={() => applyFormat('italic')} className="btn-secondary py-1 px-2 text-xs italic">I</button>
          <div className="w-px h-5 bg-gray-200 mx-0.5"/>
          {BULLETS.map(b => (
            <button key={b.value} onClick={() => insertBullet(b.value)} className="btn-secondary py-1 px-2 text-xs">{b.label}</button>
          ))}
          <div className="w-px h-5 bg-gray-200 mx-0.5"/>
          <button onClick={insertDivider} className="btn-secondary py-1 px-2 text-xs">― line</button>
          <button onClick={insertHook} className="btn-secondary py-1 px-2 text-xs">Hook ↗</button>
          <div className="w-px h-5 bg-gray-200 mx-0.5"/>
          <button
            onClick={() => setShowEmoji(o => !o)}
            className={`btn-secondary py-1 px-2 text-xs ${showEmoji ? 'bg-vbn-green-light border-vbn-green text-vbn-green' : ''}`}
          >
            😊 Emoji
          </button>
        </div>

        {/* Emoji picker */}
        {showEmoji && (
          <div className="card p-3">
            <EmojiPicker onSelect={onEmojiSelect} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {(['compose', 'preview'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium capitalize border-b-2 transition-colors -mb-px
                ${tab === t ? 'border-vbn-green text-vbn-green' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Editor / Preview */}
        {tab === 'compose' ? (
          <textarea
            ref={editorRef}
            className="input resize-none flex-1 min-h-[280px] font-mono text-sm leading-relaxed"
            placeholder={`Write your VBN post here...\n\nTip: Select text then click B or I to apply Unicode formatting that works in LinkedIn.`}
            value={body}
            onChange={e => setBody(e.target.value)}
            onBlur={e => { lastCursorRef.current = e.target.selectionStart }}
          />
        ) : (
          <div className="flex-1 min-h-[280px] card overflow-auto">
            {/* LinkedIn mock header */}
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-full bg-vbn-green flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">VBN</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Victorian Bioenergy Network</p>
                <p className="text-xs text-gray-400">Industry association · Just now</p>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans">
              {fullPost || <span className="text-gray-400">Nothing to preview yet</span>}
            </pre>
          </div>
        )}

        {/* Char count */}
        <div className={`text-right text-xs ${charCount > 3000 ? 'text-red-500' : charCount > 2400 ? 'text-yellow-500' : 'text-gray-400'}`}>
          {charCount.toLocaleString()} / 3,000
        </div>

        {/* First comment */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="section-label mb-0">First comment</span>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">link goes here</span>
          </div>
          <textarea
            className="input resize-none h-14 text-sm"
            placeholder="Paste your URL + CTA — post this as first comment immediately after publishing to protect reach..."
            value={firstComment}
            onChange={e => setFirstComment(e.target.value)}
          />
        </div>

        {/* Hashtags */}
        <div>
          <p className="section-label">Hashtags</p>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_HASHTAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors
                  ${selectedTags.has(tag)
                    ? 'bg-vbn-green text-white border-vbn-green'
                    : 'bg-vbn-green-light text-vbn-green border-green-200 hover:bg-green-100'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => copyToClipboard(fullPost, 'post')}
            className="btn-primary"
            disabled={!fullPost}
          >
            {copied === 'post' ? '✓ Copied!' : '⎘ Copy post'}
          </button>
          <button
            onClick={() => copyToClipboard(firstComment, 'comment')}
            className="btn-secondary"
            disabled={!firstComment}
          >
            {copied === 'comment' ? '✓ Copied!' : '⎘ Copy first comment'}
          </button>
        </div>
      </div>

      {/* Right: contacts */}
      <div className={`flex-shrink-0 transition-all duration-200 ${showContacts ? 'w-64' : 'w-8'}`}>
        <div className="flex items-center justify-between mb-2">
          {showContacts && <p className="section-label mb-0">@ Mentions</p>}
          <button
            onClick={() => setShowContacts(o => !o)}
            className="btn-ghost p-1 rounded text-gray-400 ml-auto"
            title={showContacts ? 'Hide contacts' : 'Show contacts'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              {showContacts
                ? <path d="M11 4L6 8l5 4"/>
                : <path d="M5 4l5 4-5 4"/>}
            </svg>
          </button>
        </div>
        {showContacts && (
          <div className="card">
            <ContactSearch onInsert={insertMention} />
          </div>
        )}
      </div>

    </div>
  )
}
