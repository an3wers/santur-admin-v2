export function copyToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('Буфер обмена не поддерживается в этом браузере')
  }

  return navigator.clipboard.writeText(text)
}
