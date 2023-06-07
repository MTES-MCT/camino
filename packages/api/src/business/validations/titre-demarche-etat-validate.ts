// valide la date et la position de l'étape en fonction des autres étapes
import type { ITitre, ITitreEtape, IDemarcheType } from '../../types.js'

import { demarcheDefinitionFind } from '../rules-demarches/definitions.js'
import { toMachineEtapes } from '../rules-demarches/machine-common.js'
import { titreEtapeTypeAndStatusValidate } from './titre-etape-type-and-status-validate.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { DemarcheId } from 'camino-common/src/demarche.js'

const titreDemarcheEtapesBuild = <T extends Pick<ITitreEtape, 'id'>>(titreEtape: T, suppression: boolean, titreDemarcheEtapes?: T[] | null): T[] => {
  if (!titreDemarcheEtapes?.length) {
    return [titreEtape]
  }

  // si nous n’ajoutons pas une nouvelle étape
  // on supprime l’étape en cours de modification ou de suppression
  const titreEtapes = titreDemarcheEtapes.reduce((acc: T[], te) => {
    if (te.id !== titreEtape.id) {
      acc.push(te)
    }

    // modification
    if (!suppression && te.id === titreEtape.id) {
      acc.push(titreEtape)
    }

    return acc
  }, [])

  // création
  if (!titreEtape.id) {
    titreEtapes.push(titreEtape)
  }

  return titreEtapes
}

// vérifie que la modification de la démarche
// est valide par rapport aux définitions des types d'étape
export const titreDemarcheUpdatedEtatValidate = (
  date: CaminoDate,
  demarcheType: IDemarcheType,
  titre: ITitre,
  titreEtape: Pick<ITitreEtape, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
  demarcheId: DemarcheId,
  titreDemarcheEtapes?: Pick<ITitreEtape, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>[] | null,
  suppression = false
): string[] => {
  let titreDemarcheEtapesNew = titreDemarcheEtapesBuild(titreEtape, suppression, titreDemarcheEtapes)
  const demarcheDefinition = demarcheDefinitionFind(titre.typeId, demarcheType.id, titreDemarcheEtapesNew, demarcheId)
  const titreDemarchesErrors: string[] = []

  // vérifie que la démarche existe dans le titre
  const titreDemarche = titre.demarches?.find(d => d.typeId === demarcheType.id)
  if (!titreDemarche) {
    throw new Error('le titre ne contient pas la démarche en cours de modification')
  }
  // pas de validation pour les démarches qui n'ont pas d'arbre d’instructions
  if (!demarcheDefinition) {
    if (!titreEtape.statutId) {
      return []
    }
    // le type d'étape correspond à la démarche et au type de titre
    const titreEtapeTypeAndStatusErrors = titreEtapeTypeAndStatusValidate(titreEtape.typeId, titreEtape.statutId, titreDemarche.type!.etapesTypes, titreDemarche.type!.nom)
    titreDemarchesErrors.push(...titreEtapeTypeAndStatusErrors)

    return titreDemarchesErrors
  }

  // si on essaye d’ajouter ou de modifier une demande non déposée
  if (titreEtape.typeId === 'mfr' && titreEtape.statutId !== 'fai' && !suppression) {
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
  } else {
    // on supprime les étapes en construction de la liste des étapes, car elle ne doivent pas ếtre prises en compte par l’arbre
    titreDemarcheEtapesNew = titreDemarcheEtapesNew.filter(te => te.statutId !== 'aco')
  }

  // vérifie que toutes les étapes existent dans l’arbre
  try {
    const ok = demarcheDefinition.machine.isEtapesOk(demarcheDefinition.machine.orderMachine(toMachineEtapes(titreDemarcheEtapesNew)))
    if (!ok) {
      titreDemarchesErrors.push('la démarche n’est pas valide')
    }
  } catch (e) {
    console.warn('une erreur est survenue', e)
    titreDemarchesErrors.push('la démarche n’est pas valide')
  }

  return titreDemarchesErrors
}
