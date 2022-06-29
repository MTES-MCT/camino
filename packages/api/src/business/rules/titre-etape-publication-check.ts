interface IDemarchePublicationIndex {
  [id: string]: string[]
}

const demarcheEtapesTypesPublication: IDemarchePublicationIndex = {
  arm: ['def', 'sco', 'aco'],
  axm: ['dex', 'rpu'],
  cxm: ['dex'],
  prm: ['rpu']
}

/**
 * Vérifie si l'étape est une étape de publication
 * @param etapeTypeId - id du type d'étape
 * @param titreTypeId - id du type de titre
 */
const titreEtapePublicationCheck = (etapeTypeId: string, titreTypeId: string) =>
  !!(
    ['dpu', 'dup', 'ihi'].includes(etapeTypeId) ||
    demarcheEtapesTypesPublication[titreTypeId]?.includes(etapeTypeId)
  )

export { titreEtapePublicationCheck }
