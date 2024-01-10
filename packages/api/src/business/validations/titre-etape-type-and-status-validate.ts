// valide le type et le statut de l'étape en fonction des type d'étapes d'une démarche
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { isTDEExist } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index.js'
import { DemarcheTypeId, DemarchesTypes } from 'camino-common/src/static/demarchesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'

export const titreEtapeTypeAndStatusValidate = (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, etapeTypeId: EtapeTypeId, etapeStatutId: EtapeStatutId | undefined): string[] => {
    if (!etapeStatutId) {
      return [`le statut est obligatoire`]
    }


    if (!isTDEExist(titreTypeId, demarcheTypeId, etapeTypeId)) {
      return [`étape "${etapeTypeId}" invalide pour une démarche "${DemarchesTypes[demarcheTypeId].nom}"`]
    }

    const etapesStatuts = getEtapesStatuts(etapeTypeId)

    const titreEtapeStatut = etapesStatuts.find(etapeStatut => etapeStatut.id === etapeStatutId)

    if (!titreEtapeStatut) {
      return [`statut de l'étape "${etapeStatutId}" invalide pour une type d'étape ${etapeTypeId} pour une démarche de type ${DemarchesTypes[demarcheTypeId].nom}`]
    }

    return []
}
