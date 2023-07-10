export type Couleur = 'error' | 'info' | 'neutral' | 'success' | 'warning'

// prettier-ignore
export const CouleursIllustratives = ['green-tilleul-verveine', 'green-bourgeon', 'green-emeraude', 'green-menthe', 'green-archipel', 'blue-ecume', 'blue-cumulus', 'purple-glycine', 'pink-macaron', 'pink-tuile', 'yellow-tournesol', 'yellow-moutarde', 'orange-terre-battue', 'brown-cafe-creme', 'brown-caramel', 'brown-opera', 'beige-gris-galet'] as const

export type CouleurIllustrative = typeof CouleursIllustratives[number]