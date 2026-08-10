import { useMessage } from 'naive-ui'

export function copyToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('Буфер обмена не поддерживается в этом браузере')
  }

  if (!text || typeof text !== 'string' || text.length === 0) {
    throw new Error('Нельзя скопировать пустую строку')
  }

  return navigator.clipboard.writeText(text)
}

export const useCopyToClipboard = () => {
  const message = useMessage()
  return async (text: string) => {
    try {
      await copyToClipboard(text)
      message.success('Значение скопировано в буфер обмена')
    } catch {
      message.error('При копировании произошла ошибка')
    }
  }
}
