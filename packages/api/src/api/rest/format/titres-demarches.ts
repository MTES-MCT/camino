import { ITitreDemarche, Index } from '../../../types.js'

import { titreEtapesSortDescByOrdre } from '../../../business/utils/titre-etapes-sort.js'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { DemarchesStatuts } from 'camino-common/src/static/demarchesStatuts.js'
import { isNotNullNorUndefined, isNullOrUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools.js'
import { TitresStatuts } from 'camino-common/src/static/titresStatuts.js'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes.js'
import { ReferencesTypes } from 'camino-common/src/static/referencesTypes.js'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes.js'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes.js'
import { Domaines } from 'camino-common/src/static/domaines.js'
import { Forets } from 'camino-common/src/static/forets.js'
import { Pool } from 'pg'
import { getCommunesIndex } from '../../../database/queries/communes.js'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes.js'
import { EntrepriseId } from 'camino-common/src/entreprise.js'
import { GetEntreprises, getEntreprises } from '../entreprises.queries.js'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape.js'

const etapesDatesStatutsBuild = (titreDemarche: ITitreDemarche) => {
  if (isNullOrUndefinedOrEmpty(titreDemarche.etapes)) return null

  const etapes = titreEtapesSortDescByOrdre(titreDemarche.etapes)

  return etapes
    .filter(e => e.isBrouillon === ETAPE_IS_NOT_BROUILLON)
    .reduce((etapesDatesStatuts, etape) => {
      const type = EtapesTypes[etape.typeId]

      if (isNullOrUndefined(type)) {
        return etapesDatesStatuts
      }

      etapesDatesStatuts[type.nom] = etape?.date ?? ''

      // si le type d'étape a plus d'un statut possible
      // (ex : fav/def ou acc/rej)
      // alors on exporte aussi le statut

      const etapesStatuts = getEtapesStatuts(type.id)
      if (etapesStatuts!.length > 1) {
        const statut = etapesStatuts!.find(s => s.id === etape.statutId)

        etapesDatesStatuts[`${type.nom}_statut`] = statut?.nom ?? ''
      }

      return etapesDatesStatuts
    }, {} as Index<string>)
}

export const titresDemarchesFormatTable = async (pool: Pool, titresDemarches: ITitreDemarche[]) => {
  const communesIndex = await getCommunesIndex(
    pool,
    titresDemarches.flatMap(titreDemarche => titreDemarche.etapes?.flatMap(etape => etape.communes?.map(({ id }) => id) ?? []) ?? [])
  )
  const entreprises = await getEntreprises(pool)
  const entreprisesIndex = entreprises.reduce<Record<EntrepriseId, GetEntreprises>>((acc, entreprise) => {
    acc[entreprise.id] = entreprise

    return acc
  }, {})

  return titresDemarches.map(titreDemarche => {
    const titre = titreDemarche.titre!

    const etapesTypesStatuts = etapesDatesStatutsBuild(titreDemarche)

    const sortedEtapeByOrdre = titreEtapesSortDescByOrdre(titreDemarche.etapes ?? [])
    const etapeWithPoints = sortedEtapeByOrdre.find(etape => isNotNullNorUndefined(etape.geojson4326Perimetre)) ?? null
    const etapeWithTitulaires = sortedEtapeByOrdre.find(etape => isNotNullNorUndefined(etape.titulaireIds)) ?? null
    const etapeWithAmodiataires = sortedEtapeByOrdre.find(etape => isNotNullNorUndefined(etape.amodiataireIds)) ?? null

    const titreDemarcheNew = {
      titre_id: titre.slug,
      titre_nom: titre.nom,
      titre_domaine: Domaines[getDomaineId(titre.typeId)].nom,
      titre_type: TitresTypesTypes[getTitreTypeType(titre.typeId)].nom,
      titre_statut: isNotNullNorUndefined(titre.titreStatutId) ? TitresStatuts[titre.titreStatutId].nom : '',
      type: DemarchesTypes[titreDemarche.typeId].nom,
      statut: DemarchesStatuts[titreDemarche.statutId!].nom,
      description: titreDemarche.description,
      'surface km2': etapeWithPoints ? etapeWithPoints.surface : '',
      titre_references: titre.references?.map(r => `${ReferencesTypes[r.referenceTypeId].nom} : ${r.nom}`).join(';'),
      titulaires_noms: (etapeWithTitulaires?.titulaireIds ?? []).map(id => entreprisesIndex[id].nom ?? '').join(';'),
      titulaires_adresses: (etapeWithTitulaires?.titulaireIds ?? []).map(id => `${entreprisesIndex[id].adresse} ${entreprisesIndex[id].code_postal} ${entreprisesIndex[id].commune}`).join(';'),
      titulaires_legal: (etapeWithTitulaires?.titulaireIds ?? []).map(id => entreprisesIndex[id].legal_etranger ?? entreprisesIndex[id].legal_siren).join(';'),
      amodiataires_noms: (etapeWithAmodiataires?.amodiataireIds ?? []).map(id => entreprisesIndex[id].nom).join(';'),
      amodiataires_adresses: (etapeWithAmodiataires?.amodiataireIds ?? []).map(id => `${entreprisesIndex[id].adresse} ${entreprisesIndex[id].code_postal} ${entreprisesIndex[id].commune}`).join(';'),
      amodiataires_legal: (etapeWithAmodiataires?.amodiataireIds ?? []).map(id => entreprisesIndex[id].legal_etranger ?? entreprisesIndex[id].legal_siren).join(';'),
      ...etapesTypesStatuts,
      forets: etapeWithPoints ? etapeWithPoints.forets?.map(fId => Forets[fId].nom).join(';') : '',
      communes: etapeWithPoints ? etapeWithPoints.communes?.map(f => communesIndex[f.id]).join(';') : '',
    }

    return titreDemarcheNew
  })
}
