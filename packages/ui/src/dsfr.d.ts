declare global {
  export const dsfr: {
    (value: HTMLElement): {
      modal: { conceal: () => void; disclose: () => void }
      navigation: {
        members: { conceal: () => void }[]
      }
    }
    start: () => void
    stop: () => void
  }
}

export {}
