// valide la date et la position de l'étape en fonction des autres étapes
import {
  ITitre,
  ITitreEtape,
  IDemarcheType,
  ITitreDemarche,
  DemarcheId
} from '../../types.js'

import {
  demarcheDefinitionFind,
  IDemarcheDefinitionRestrictions,
  isDemarcheDefinitionMachine
} from '../rules-demarches/definitions.js'
import { contenusTitreEtapesIdsFind } from '../utils/props-titre-etapes-ids-find.js'
import { titreEtapesSortAscByDate } from '../utils/titre-etapes-sort.js'
import { titreEtapeEtatValidate } from './titre-etape-etat-validate.js'
import { objectClone } from '../../tools/index.js'
import { toMachineEtapes } from '../rules-demarches/machine-common.js'
import { titreEtapeTypeAndStatusValidate } from './titre-etape-type-and-status-validate.js'
import { contenuFormat } from '../../api/rest/titre-contenu.js'

const titreDemarcheEtapesBuild = (
  titreEtape: ITitreEtape,
  suppression: boolean,
  titreDemarcheEtapes?: ITitreEtape[] | null
) => {
  if (!titreDemarcheEtapes?.length) {
    return [titreEtape]
  }

  // si nous n’ajoutons pas une nouvelle étape
  // on supprime l’étape en cours de modification ou de suppression
  const titreEtapes = titreDemarcheEtapes.reduce((acc: ITitreEtape[], te) => {
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

// vérifie que  la démarche est valide par rapport aux définitions des types d'étape
export const titreDemarcheEtatValidate = (
  demarcheDefinitionRestrictions: IDemarcheDefinitionRestrictions,
  demarcheType: IDemarcheType,
  titreDemarche: ITitreDemarche,
  titreEtapes: ITitreEtape[],
  titre: ITitre
) => {
  // Si on tente d’insérer ou de modifier une étape, il faut regarder
  // qu’on puisse la mettre avec son nouveau etapeTypeId à la nouvelle date souhaitée
  // et que les étapes après celle-ci soient toujours possibles

  titreEtapes = titreEtapesSortAscByDate(
    titreEtapes,
    titreDemarche.id,
    demarcheType,
    titre.typeId
  )

  // on copie la démarche car on va les modifier en ajoutant les étapes une à une
  const demarche = objectClone(titreDemarche)

  for (let i = 0; i < titreEtapes.length; i++) {
    // On doit recalculer les sections de titre pour chaque étape,
    // car elles ont peut-être été modifiées après l’étape en cours
    const etapes = titreEtapes.slice(0, i)
    demarche.etapes = etapes

    const contenusTitreEtapesIds = contenusTitreEtapesIdsFind(
      titre.titreStatutId!,
      [demarche],
      titre.type!.contenuIds
    )

    let contenu = null
    if (contenusTitreEtapesIds) {
      contenu = contenuFormat({ demarches: [demarche], contenusTitreEtapesIds })
    }

    const titreEtapeErrors = titreEtapeEtatValidate(
      demarcheDefinitionRestrictions,
      titreEtapes[i].typeId!,
      etapes,
      contenu
    )

    if (titreEtapeErrors.length) {
      return titreEtapeErrors
    }
  }

  return []
}

// vérifie que la modification de la démarche
// est valide par rapport aux définitions des types d'étape
export const titreDemarcheUpdatedEtatValidate = (
  demarcheType: IDemarcheType,
  titre: ITitre,
  titreEtape: ITitreEtape,
  demarcheId: DemarcheId,
  titreDemarcheEtapes?: ITitreEtape[] | null,
  suppression = false
) => {
  let titreDemarcheEtapesNew = titreDemarcheEtapesBuild(
    titreEtape,
    suppression,
    titreDemarcheEtapes
  )
  const demarcheDefinition = demarcheDefinitionFind(
    titre.typeId,
    demarcheType.id,
    titreDemarcheEtapesNew,
    demarcheId
  )
  const titreDemarchesErrors: string[] = []

  // vérifie que la démarche existe dans le titre
  const titreDemarche = titre.demarches?.find(d => d.typeId === demarcheType.id)
  if (!titreDemarche) {
    throw new Error(
      'le titre ne contient pas la démarche en cours de modification'
    )
  }
  // pas de validation pour les démarches qui n'ont pas d'arbre d’instructions
  if (!demarcheDefinition) {
    if (!titreEtape.statutId) {
      return []
    }
    // le type d'étape correspond à la démarche et au type de titre
    const titreEtapeTypeAndStatusErrors = titreEtapeTypeAndStatusValidate(
      titreEtape.typeId,
      titreEtape.statutId,
      titreDemarche.type!.etapesTypes,
      titreDemarche.type!.nom
    )
    titreDemarchesErrors.push(...titreEtapeTypeAndStatusErrors)

    return titreDemarchesErrors
  }

  // si on essaye d’ajouter ou de modifier une demande non déposée
  if (
    titreEtape.typeId === 'mfr' &&
    titreEtape.statutId !== 'fai' &&
    !suppression
  ) {
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
    titreDemarcheEtapesNew = titreDemarcheEtapesNew.filter(
      te => te.statutId !== 'aco'
    )
  }

  // vérifie que toutes les étapes existent dans l’arbre
  if (isDemarcheDefinitionMachine(demarcheDefinition)) {
    try {
      const ok = demarcheDefinition.machine.isEtapesOk(
        demarcheDefinition.machine.orderMachine(
          toMachineEtapes(titreDemarcheEtapesNew)
        )
      )
      if (!ok) {
        titreDemarchesErrors.push('la démarche n’est pas valide')
      }
    } catch (e) {
      console.warn('une erreur est survenue', e)
      titreDemarchesErrors.push('la démarche n’est pas valide')
    }
  } else {
    // le type d'étape correspond à la démarche et au type de titre
    const titreEtapeTypeAndStatusErrors = titreEtapeTypeAndStatusValidate(
      titreEtape.typeId,
      titreEtape.statutId,
      titreDemarche.type!.etapesTypes,
      titreDemarche.type!.nom
    )
    titreDemarchesErrors.push(...titreEtapeTypeAndStatusErrors)

    const etapeTypeIdsValid = Object.keys(demarcheDefinition.restrictions)

    const etapeInconnue = titreDemarcheEtapesNew.find(
      etape => !etapeTypeIdsValid.includes(etape.typeId!)
    )
    if (etapeInconnue) {
      return [`l’étape ${etapeInconnue.typeId} n’existe pas dans l’arbre`]
    }

    // On vérifie que la nouvelle démarche respecte son arbre d’instructions
    titreDemarchesErrors.push(
      ...titreDemarcheEtatValidate(
        demarcheDefinition.restrictions,
        demarcheType,
        titreDemarche,
        titreDemarcheEtapesNew,
        titre
      )
    )
  }

  return titreDemarchesErrors
}
