import dateFormat from 'dateformat'

import {
  IToken,
  ITitreDemande,
  ITitreEtape,
  ISection,
  ITitreEntreprise
} from '../../../types'
import {
  userGet,
  utilisateurTitreCreate
} from '../../../database/queries/utilisateurs'
import { titreDemandeEntreprisesGet } from '../../../database/queries/entreprises'
import { domaineGet, etapeTypeGet } from '../../../database/queries/metas'
import {
  titreCreate,
  titreGet,
  titresGet
} from '../../../database/queries/titres'
import { titreDemarcheCreate } from '../../../database/queries/titres-demarches'
import { titreEtapeUpsert } from '../../../database/queries/titres-etapes'

import titreUpdateTask from '../../../business/titre-update'
import titreDemarcheUpdateTask from '../../../business/titre-demarche-update'
import titreEtapeUpdateTask from '../../../business/titre-etape-update'
import { userSuper } from '../../../database/user-super'
import { specifiquesGet } from './titres-etapes'
import {
  isAdministrationAdmin,
  isAdministrationEditeur,
  isBureauDEtudes,
  isEntreprise,
  isSuper
} from 'camino-common/src/roles'
import { linkTitres } from '../../../database/queries/titres-titres'
import { getLinkConfig } from 'camino-common/src/permissions/titres'
import { checkTitreLinks } from '../../../business/validations/titre-links-validate'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'

export const titreDemandeCreer = async (
  {
    titreDemande
  }: { titreDemande: ITitreDemande & { titreFromIds?: string[] } },
  context: IToken
) => {
  try {
    const user = await userGet(context.user?.id)

    if (
      !user ||
      (!isSuper(user) &&
        !isAdministrationAdmin(user) &&
        !isAdministrationEditeur(user) &&
        !isEntreprise(user) &&
        !isBureauDEtudes(user))
    ) {
      throw new Error('permissions insuffisantes')
    }

    if (isEntreprise(user) || isBureauDEtudes(user)) {
      if (titreDemande.references?.length) {
        throw new Error('permissions insuffisantes')
      }

      const entreprises = await titreDemandeEntreprisesGet(
        { fields: { id: {} } },
        user
      )

      const entreprise = entreprises.find(
        e => e.id === titreDemande.entrepriseId
      )

      if (!entreprise) {
        throw new Error('permissions insuffisantes')
      }

      const titreType = entreprise.titresTypes!.find(
        tt => tt.id === titreDemande.typeId
      )

      if (!titreType) {
        throw new Error('permissions insuffisantes')
      }
    }

    if (
      isSuper(user) ||
      isAdministrationAdmin(user) ||
      isAdministrationEditeur(user)
    ) {
      const domaine = await domaineGet(
        titreDemande.domaineId,
        { fields: { titresTypes: { id: {} } } },
        user
      )
      const titreType = domaine?.titresTypes.find(
        tt => tt.id === titreDemande.typeId
      )

      if (!user || !titreType || !titreType.titresCreation)
        throw new Error('droits insuffisants')
    }
    // insert le titre dans la base
    const titre = await titreCreate(
      {
        nom: titreDemande.nom,
        typeId: titreDemande.typeId,
        domaineId: titreDemande.domaineId,
        references: titreDemande.references,
        propsTitreEtapesIds: {}
      },
      { fields: {} }
    )

    const titreId = titre.id

    const linkConfig = getLinkConfig(titreDemande.typeId, [])
    if (linkConfig && titreDemande.titreFromIds === undefined) {
      throw new Error(
        'Le champ titreFromIds est obligatoire pour ce type de titre'
      )
    }

    if (titreDemande.titreFromIds !== undefined) {
      const titresFrom = await titresGet(
        { ids: titreDemande.titreFromIds },
        { fields: { id: {} } },
        user
      )

      checkTitreLinks(titreDemande, titreDemande.titreFromIds, titresFrom, [])

      await linkTitres({
        linkTo: titre.id,
        linkFrom: titreDemande.titreFromIds
      })
      delete titreDemande.titreFromIds
    }
    await titreUpdateTask(titre.id)

    const titreDemarche = await titreDemarcheCreate({
      titreId,
      typeId: 'oct'
    })

    await titreDemarcheUpdateTask(titreDemarche.id, titreDemarche.titreId)

    const updatedTitre = await titreGet(
      titreId,
      { fields: { demarches: { id: {} } } },
      userSuper
    )

    if (!updatedTitre) {
      throw new Error('recupération du titre nouvellement créé impossible')
    }

    const date = dateFormat(new Date(), 'yyyy-mm-dd')
    const titreDemarcheId = updatedTitre.demarches![0].id

    const titulaire = { id: titreDemande.entrepriseId } as ITitreEntreprise
    const titreEtape: Omit<ITitreEtape, 'id'> = {
      titreDemarcheId,
      typeId: 'mfr',
      statutId: 'aco',
      date,
      duree: titreDemande.typeId === 'arm' ? 4 : undefined,
      titulaires: [titulaire]
    }

    let decisionsAnnexesEtapeTypeIds: EtapeTypeId[] = []
    if (titreDemande.typeId === 'axm') {
      // si c’est une AXM, d’après l’arbre d’instructions il y a 2 décisions annexes
      // - la décision du propriétaire du sol (asl)
      // - la décision de la mission autorité environnementale (dae)
      decisionsAnnexesEtapeTypeIds = ['asl', 'dae']
    }
    if (decisionsAnnexesEtapeTypeIds.length) {
      titreEtape.decisionsAnnexesSections = []

      for (const etapeTypeId of decisionsAnnexesEtapeTypeIds) {
        const etapeType = await etapeTypeGet(etapeTypeId, {
          fields: {
            documentsTypes: { id: {} }
          }
        })

        const etapesStatuts = getEtapesStatuts(etapeTypeId)

        const decisionAnnexeSections: ISection = {
          id: etapeTypeId,
          nom: etapeType!.nom,
          elements: [
            {
              id: 'date',
              nom: 'Date',
              type: 'date'
            },
            {
              id: 'statutId',
              nom: 'Statut',
              type: 'select',
              valeurs: etapesStatuts.map(statut => ({
                id: statut.id,
                nom: statut.nom
              }))
            }
          ]
        }

        const { documentsTypes } = await specifiquesGet(
          titreDemande.typeId,
          titreDemarche.typeId,
          etapeType!
        )

        documentsTypes
          ?.filter(dt => !dt.optionnel)
          .forEach(dt => {
            decisionAnnexeSections.elements!.push({
              id: dt.id,
              nom: dt.nom!,
              type: 'file'
            })
          })

        titreEtape.decisionsAnnexesSections.push(decisionAnnexeSections)
      }
    }
    const updatedTitreEtape = await titreEtapeUpsert(titreEtape, user, titreId)

    await titreEtapeUpdateTask(
      updatedTitreEtape.id,
      titreEtape.titreDemarcheId,
      user
    )

    const titreEtapeId = updatedTitreEtape.id

    // on abonne l’utilisateur au titre
    await utilisateurTitreCreate({ utilisateurId: user.id, titreId })

    return {
      titreId,
      titreEtapeId
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}
