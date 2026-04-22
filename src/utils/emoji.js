const IMAGE_EXT_REGEX = /\.(png|jpe?g|webp|gif|svg)$/i

function normalizeEmojiPathAlias(value) {
  if (!value) return value
  return value
    .replace(/^\/emoji\//i, '/emojis/')
    .replace(/^emoji\//i, 'emojis/')
}

export function isEmojiImage(emoji) {
  if (typeof emoji !== 'string') return false
  const value = normalizeEmojiPathAlias(emoji.trim())
  if (!value) return false

  return (
    value.startsWith('/emojis/') ||
    value.startsWith('emojis/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    IMAGE_EXT_REGEX.test(value)
  )
}

export function normalizeEmojiSrc(emoji) {
  const value = normalizeEmojiPathAlias((emoji ?? '').toString().trim())
  if (!value) return ''
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('/')
  ) {
    return value
  }
  return `/${value}`
}

export function getEmojiText(emoji, fallback = '🍰') {
  const value = (emoji ?? '').toString().trim()
  if (!value) return fallback
  if (isEmojiImage(value)) return fallback
  return value
}
