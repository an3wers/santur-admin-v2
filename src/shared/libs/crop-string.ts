export const cropString = (srt: string, count = 40) => {
  return srt.length > count ? `${srt.slice(0, count)}...` : srt
}
