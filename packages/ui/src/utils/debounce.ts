export const createDebounce = () => {
  let timeout: ReturnType<typeof setTimeout>

  return function (fnc: () => void, delayMs = 500) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fnc()
    }, delayMs)
  }
}
