import { prefixKeysMap } from './prefix-keys-map'

export const getKeyWithPrefix = (key: string, ctx: string) => {
  const prefix = prefixKeysMap[ctx as keyof typeof prefixKeysMap]
  return (prefix ?? '') + ':' + key
}
