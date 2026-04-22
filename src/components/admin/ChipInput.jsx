import { useState } from 'react'

export default function ChipInput({ chips, onChange, placeholder = 'Agregar + Enter' }) {
  const [input, setInput] = useState('')

  function handleKey(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const val = input.trim()
      if (!chips.includes(val)) {
        onChange([...chips, val])
      }
      setInput('')
    }
    if (e.key === 'Backspace' && !input && chips.length) {
      onChange(chips.slice(0, -1))
    }
  }

  function removeChip(chip) {
    onChange(chips.filter(c => c !== chip))
  }

  return (
    <div className="chip-input-wrapper">
      <div className="chips-list" style={{ marginTop: 0, flexWrap: 'wrap' }}>
        {chips.map(c => (
          <span key={c} className="chip">
            {c}
            <button type="button" onClick={() => removeChip(c)}>×</button>
          </span>
        ))}
        <input
          type="text"
          className="chip-text-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={chips.length === 0 ? placeholder : ''}
        />
      </div>
    </div>
  )
}
