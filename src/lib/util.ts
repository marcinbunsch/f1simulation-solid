export function convertTimeToFormat(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds - minutes * 60
  const remainingMilliseconds = Math.floor(
    (remainingSeconds - Math.floor(remainingSeconds)) * 1000
  )
  const fullSeconds = Math.floor(remainingSeconds)
  // return `${minutes}:${remainingSeconds.toFixed(2)}`
  return `${minutes}:${fullSeconds
    .toString()
    .padStart(2, "0")}.${remainingMilliseconds.toString().padStart(3, "0")}`
}

export function convertIntervalToFormat(interval: number) {
  const seconds = Math.abs(Math.round(interval * 100) / 100)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds - minutes * 60
  const remainingMilliseconds = Math.floor(
    (remainingSeconds - Math.floor(remainingSeconds)) * 1000
  )
  const fullSeconds = Math.floor(remainingSeconds)
  // return `${minutes}:${remainingSeconds.toFixed(2)}`
  if (minutes > 0) {
    return `+${minutes}:${fullSeconds
      .toString()
      .padStart(2, "0")}.${remainingMilliseconds.toString().padStart(3, "0")}`
  } else {
    return `+${fullSeconds.toString()}.${remainingMilliseconds
      .toString()
      .padStart(3, "0")}`
  }
}

export function convertToFloatWithTwoDecimals(num: number) {
  return Math.floor(num * 100) / 100
}
