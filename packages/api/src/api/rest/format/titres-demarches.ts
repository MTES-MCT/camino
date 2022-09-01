import { ITitreDemarche, Index } from '../../../types'

import { titreEtapesSortDescByOrdre } from '../../../business/utils/titre-etapes-sort'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { DemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'

const etapesDatesStatutsBuild = (titreDemarche: ITitreDemarche) => {
  if (!titreDemarche.etapes?.length) return null

  const etapes = titreEtapesSortDescByOrdre(titreDemarche.etapes)

  return etapes
    .filter(e => e.statutId !== 'aco')
    .reduce((etapesDatesStatuts, etape) => {
      const type = etape.type

      if (!type) return etapesDatesStatuts

      etapesDatesStatuts[type.nom] = etape?.date || ''

      // si le type d'étape a plus d'un statut possible
      // (ex : fav/def ou acc/rej)
      // alors on exporte aussi le statut

      const etapesStatuts = getEtapesStatuts(type.id)
      if (etapesStatuts!.length > 1) {
        const statut = etapesStatuts!.find(s => s.id === etape.statutId)

        etapesDatesStatuts[`${type.nom}_statut`] = statut?.nom || ''
      }

      return etapesDatesStatuts
    }, {} as Index<string>)
}

export const titresDemarchesFormatTable = (titresDemarches: ITitreDemarche[]) =>
  titresDemarches.map(titreDemarche => {
    const titre = titreDemarche.titre!

    const etapesTypesStatuts = etapesDatesStatutsBuild(titreDemarche)

    const etapeWithPoints = titreDemarche.etapes
      ? titreEtapesSortDescByOrdre(titreDemarche.etapes).find(
          etape => etape.points?.length
        )
      : undefined

    const titreDemarcheNew = {
      titre_id: titre.slug,
      titre_nom: titre.nom,
      titre_domaine: titre.domaine!.nom,
      titre_type: titre.type!.type.nom,
      titre_statut: titre.statut!.nom,
      type: titreDemarche.type!.nom,
      statut: DemarchesStatuts[titreDemarche.statutId!].nom,
      description: titreDemarche.description,
      titre_references: titre.references
        ?.map(r => `${r.type?.nom} : ${r.nom}`)
        .join(';'),
      titulaires_noms: titre.titulaires!.map(e => e.nom).join(';'),
      titulaires_adresses: titre
        .titulaires!.map(e => `${e.adresse} ${e.codePostal} ${e.commune}`)
        .join(';'),
      titulaires_legal: titre
        .titulaires!.map(e => e.legalEtranger || e.legalSiren)
        .join(';'),
      amodiataires_noms: titre.amodiataires!.map(e => e.nom).join(';'),
      amodiataires_adresses: titre
        .amodiataires!.map(e => `${e.adresse} ${e.codePostal} ${e.commune}`)
        .join(';'),
      amodiataires_legal: titre
        .amodiataires!.map(e => e.legalEtranger || e.legalSiren)
        .join(';'),
      ...etapesTypesStatuts,
      forets: etapeWithPoints
        ? etapeWithPoints.forets?.map(f => f.nom).join(';')
        : '',
      communes: etapeWithPoints
        ? etapeWithPoints.communes?.map(f => f.nom).join(';')
        : ''
    }

    return titreDemarcheNew
  })
