'use client'

import { useState, useMemo } from 'react'

type Props = {
  onSelect: (emoji: string) => void
}

const CATEGORIES: Record<string, string[]> = {
  Popular: ['🔥','💡','🌱','♻️','⚡','🌍','🚀','💪','✅','👏','🙌','📢','📣','🎯','💰','📊','📈','🔗','🤝','💬','❓','⚠️','🏆','🌟','✨','💥','👀','💯','🎉','🔑','📌','🗓️','🧵','🔔','📰'],
  Nature:   ['🌱','🌿','🍃','🌾','🌲','🌳','🌻','🌊','💧','🔥','⚡','☀️','🌤️','🌍','🌏','🌎','♻️','🌬️','❄️','🌈','🌱','🪴','🍀','🌺','🌸','🦋','🐝','🌾','🌵','🪨'],
  Energy:   ['⚡','🔋','💡','🔌','☀️','💨','🌊','⚗️','🧪','🔬','🏭','🚗','🚌','✈️','🛢️','⛽','🔥','💧','🌡️','📡','🔭','⚙️','🛠️','🔩','💎','⚗️','🧲','🪫','🔋','🌐'],
  Business: ['📊','📈','📉','💰','💵','🏦','🤝','📋','📌','🗂️','💼','🏢','📧','📞','📱','💻','🖥️','📝','🗓️','📅','🎯','✅','❌','⚠️','📣','📢','🔔','🗣️','🤔','💬'],
  People:   ['👏','🙌','💪','🤝','👍','🙏','🫡','🤔','💬','👋','🫶','❤️','🧠','✍️','🏃','🧑‍💼','👩‍🔬','👨‍🔬','🧑‍🌾','👩‍💻','🧑‍🏫','🤜','🤛','🫂','👐','🙋','🙅','💁','🙆','🧐'],
  Symbols:  ['✅','❌','⚠️','🔑','🏆','🥇','🌟','✨','💥','🔴','🟢','🟡','🔵','⬆️','➡️','⬇️','↩️','🔷','🔶','🔸','🔹','▶️','⏩','🔃','🔄','💫','⭐','🌐','🔒','🔓'],
}

export default function EmojiPicker({ onSelect }: Props) {
  const [activeCat, setActiveCat] = useState('Popular')
  const [query, setQuery] = useState('')

  const displayed = useMemo(() => {
    if (query.trim()) {
      const all = [...new Set(Object.values(CATEGORIES).flat())]
      return all
    }
    return CATEGORIES[activeCat] ?? []
  }, [activeCat, query])

  return (
    <div className="flex flex-col gap-2">
      <input
        className="input text-xs py-1.5"
        placeholder="Search emoji..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {!query && (
        <div className="flex flex-wrap gap-1">
          {Object.keys(CATEGORIES).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-2 py-0.5 rounded text-xs border transition-colors
                ${activeCat === cat
                  ? 'bg-vbn-green text-white border-vbn-green'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-10 gap-0.5 max-h-36 overflow-y-auto">
        {displayed.map((e, i) => (
          <button
            key={i}
            onClick={() => onSelect(e)}
            className="text-xl p-1 rounded hover:bg-gray-100 transition-colors leading-none"
            title={e}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}
