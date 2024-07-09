// valide la date et la position de l'étape en fonction des autres étapes
import { DeepReadonly, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools.js'
import type { ITitre, ITitreEtape } from '../../types.js'

import { demarcheDefinitionFind } from '../rules-demarches/definitions.js'
import { titreEtapeForMachineValidator, toMachineEtapes } from '../rules-demarches/machine-common.js'
import { tdeOldTitreEtapeTypeAndStatusValidate } from './titre-etape-type-and-status-validate.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { ETAPE_IS_BROUILLON } from 'camino-common/src/etape.js'

const titreDemarcheEtapesBuild = <T extends Pick<Partial<ITitreEtape>, 'id'>>(titreEtape: DeepReadonly<T>, suppression: boolean, titreDemarcheEtapes?: DeepReadonly<T[]> | null): DeepReadonly<T[]> => {
  if (isNullOrUndefinedOrEmpty(titreDemarcheEtapes)) {
    return [titreEtape]
  }

  // si nous n’ajoutons pas une nouvelle étape
  // on supprime l’étape en cours de modification ou de suppression
  const titreEtapes = titreDemarcheEtapes.reduce((acc: DeepReadonly<T[]>, te) => {
    if (te.id !== titreEtape.id) {
      acc = [...acc, te]
    }

    // modification
    if (!suppression && te.id === titreEtape.id) {
      acc = [...acc, titreEtape]
    }

    return acc
  }, [])

  // création
  if (!titreEtape.id) {
    return [...titreEtapes, titreEtape]
  }

  return titreEtapes
}

// vérifie que la modification de la démarche
// est valide par rapport aux définitions des types d'étape
export const titreDemarcheUpdatedEtatValidate = (
  demarcheTypeId: DemarcheTypeId,
  titre: Pick<ITitre, 'typeId' | 'demarches'>,
  titreEtape: Pick<Partial<ITitreEtape>, 'id'> & Pick<ITitreEtape, 'statutId' | 'typeId' | 'date' | 'contenu' | 'surface' | 'communes' | 'isBrouillon'>,
  demarcheId: DemarcheId,
  titreDemarcheEtapes?: Pick<ITitreEtape, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'communes' | 'surface' | 'isBrouillon'>[] | null,
  suppression = false
): string[] => {
  const titreDemarcheEtapesNew = titreDemarcheEtapesBuild(titreEtape, suppression, titreDemarcheEtapes)
  const demarcheDefinition = demarcheDefinitionFind(titre.typeId, demarcheTypeId, titreDemarcheEtapesNew, demarcheId)
  const titreDemarchesErrors: string[] = []

  // vérifie que la démarche existe dans le titre
  const titreDemarche = titre.demarches?.find(d => d.typeId === demarcheTypeId)
  if (!titreDemarche) {
    throw new Error('le titre ne contient pas la démarche en cours de modification')
  }
  // pas de validation pour les démarches qui n'ont pas de machine
  if (!demarcheDefinition) {
    if (!titreEtape.statutId) {
      return []
    }
    // le type d'étape correspond à la démarche et au type de titre
    const titreEtapeTypeAndStatusErrors = tdeOldTitreEtapeTypeAndStatusValidate(titre.typeId, titreDemarche.typeId, titreEtape.typeId, titreEtape.statutId)
    titreDemarchesErrors.push(...titreEtapeTypeAndStatusErrors)

    return titreDemarchesErrors
  }

  // si on essaye d’ajouter ou de modifier une demande non déposée
  if (titreEtape.typeId === 'mfr' && titreEtape.isBrouillon === ETAPE_IS_BROUILLON && !suppression) {
    const etapesDemande = titreDemarcheEtapes?.filter(te => te.typeId === 'mfr')

    // si c’est la création de la première demande, pas besoin de faire de vérification avec l’arbre
    if (!etapesDemande || !etapesDemande.length) {
      return []
    }

    // ou si on modifie la demande déja en construction, pas besoin de faire de vérification avec l’arbre
    if (etapesDemande.length === 1 && titreEtape.id === etapesDemande[0].id) {
      return []
    }

    return ['il y a déjà une demande en construction']
  }

  // vérifie que toutes les étapes existent dans l’arbre
  try {
    const etapes = titreDemarcheEtapesNew.map(etape => titreEtapeForMachineValidator.omit({ id: true, ordre: true }).parse(etape))
    const ok = demarcheDefinition.machine.isEtapesOk(demarcheDefinition.machine.orderMachine(toMachineEtapes(etapes)))
    if (!ok) {
      titreDemarchesErrors.push('la démarche n’est pas valide')
    }
  } catch (e) {
    console.warn('une erreur est survenue', e)
    titreDemarchesErrors.push('la démarche n’est pas valide')
  }

  return titreDemarchesErrors
}
