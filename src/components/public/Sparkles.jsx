import { useMemo } from 'react'

export default function Sparkles() {
  const sparkles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${10 + i * 12}%`,
      top: `${15 + (i % 3) * 25}%`,
      delay: `${i * 0.7}s`,
      size: i % 2 === 0 ? '5px' : '8px',
    })), [])

  return (
    <>
      {sparkles.map(s => (
        <div
          key={s.id}
          className="sparkle"
          style={{
            left: s.left,
            top: s.top,
            animationDelay: s.delay,
            width: s.size,
            height: s.size,
          }}
        />
      ))}
    </>
  )
}
