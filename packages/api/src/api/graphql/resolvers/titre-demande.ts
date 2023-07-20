import { ITitreDemande, ITitreEtape, ITitreEntreprise, Context } from '../../../types.js'
import { titreCreate, titreGet, titresGet } from '../../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../../database/queries/titres-demarches.js'
import { titreEtapeUpsert } from '../../../database/queries/titres-etapes.js'

import titreUpdateTask from '../../../business/titre-update.js'
import { titreDemarcheUpdate } from '../../../business/titre-demarche-update.js'
import titreEtapeUpdateTask from '../../../business/titre-etape-update.js'
import { userSuper } from '../../../database/user-super.js'
import { isBureauDEtudes, isEntreprise } from 'camino-common/src/roles.js'
import { linkTitres } from '../../../database/queries/titres-titres.js'
import { getLinkConfig, assertsCanCreateTitre } from 'camino-common/src/permissions/titres.js'
import { checkTitreLinks } from '../../../business/validations/titre-links-validate.js'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes.js'
import { utilisateurTitreCreate } from '../../../database/queries/utilisateurs.js'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { getSections, SectionsElement } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { TitreId } from 'camino-common/src/titres.js'

export const titreDemandeCreer = async ({ titreDemande }: { titreDemande: ITitreDemande & { titreFromIds?: TitreId[] } }, { user, pool }: Context) => {
  try {
    assertsCanCreateTitre(user, titreDemande.typeId)

    if (isEntreprise(user) || isBureauDEtudes(user)) {
      if (titreDemande.references?.length) {
        throw new Error('permissions insuffisantes')
      }
    }

    // insert le titre dans la base
    const titre = await titreCreate(
      {
        nom: titreDemande.nom,
        typeId: titreDemande.typeId,
        titreStatutId: 'ind',
        references: titreDemande.references,
        propsTitreEtapesIds: {},
      },
      { fields: {} }
    )

    const titreId = titre.id

    const linkConfig = getLinkConfig(titreDemande.typeId, [])
    if (linkConfig && titreDemande.titreFromIds === undefined) {
      throw new Error('Le champ titreFromIds est obligatoire pour ce type de titre')
    }

    if (titreDemande.titreFromIds !== undefined && titreDemande.titreFromIds.length > 0) {
      const titresFrom = await titresGet({ ids: titreDemande.titreFromIds }, { fields: { id: {} } }, user)

      checkTitreLinks(titreDemande, titreDemande.titreFromIds, titresFrom, [])

      await linkTitres({
        linkTo: titre.id,
        linkFrom: titreDemande.titreFromIds,
      })
      delete titreDemande.titreFromIds
    }
    await titreUpdateTask(titre.id)

    const titreDemarche = await titreDemarcheCreate({
      titreId,
      typeId: 'oct',
    })

    await titreDemarcheUpdate(pool, titreDemarche.id, titreDemarche.titreId)

    const updatedTitre = await titreGet(titreId, { fields: { demarches: { id: {} } } }, userSuper)

    if (!updatedTitre) {
      throw new Error('recupération du titre nouvellement créé impossible')
    }

    const date = toCaminoDate(new Date())
    const titreDemarcheId = updatedTitre.demarches![0].id

    const titulaire = { id: titreDemande.entrepriseId } as ITitreEntreprise
    const titreEtape: Omit<ITitreEtape, 'id'> = {
      titreDemarcheId,
      typeId: 'mfr',
      statutId: 'aco',
      date,
      duree: titreDemande.typeId === 'arm' ? 4 : undefined,
      titulaires: [titulaire],
    }

    if (isBureauDEtudes(user) || isEntreprise(user)) {
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
          const etapeType = EtapesTypes[etapeTypeId]

          const etapesStatuts = getEtapesStatuts(etapeTypeId)

          const documentsElements: DeepReadonly<SectionsElement[]> = (getDocuments(titreDemande.typeId, titreDemarche.typeId, etapeTypeId)?.filter(dt => !dt.optionnel) ?? []).map(dt => ({
            id: dt.id,
            nom: dt.nom!,
            type: 'file',
          }))

          const elements: (DeepReadonly<SectionsElement> & { sectionId: string })[] = []
          const etapeTypeSections = [...getSections(titre.typeId, titreDemarche.typeId, etapeTypeId)]
          if (etapeTypeSections.length) {
            etapeTypeSections.forEach(section => {
              section.elements?.forEach(element => {
                elements.push({ ...element, sectionId: section.id })
              })
            })
          }

          titreEtape.decisionsAnnexesSections = [
            ...titreEtape.decisionsAnnexesSections,
            {
              id: etapeTypeId,
              nom: etapeType.nom,
              elements: [
                {
                  id: 'date',
                  nom: 'Date',
                  type: 'date',
                },
                {
                  id: 'statutId',
                  nom: 'Statut',
                  type: 'select',
                  options: etapesStatuts.map(statut => ({
                    id: statut.id,
                    nom: statut.nom,
                  })),
                },
                ...elements,
                ...documentsElements,
              ],
            },
          ]
        }
      }
    }
    const updatedTitreEtape = await titreEtapeUpsert(titreEtape, user, titreId)
    await titreEtapeUpdateTask(pool, updatedTitreEtape.id, titreEtape.titreDemarcheId, user)

    const titreEtapeId = updatedTitreEtape.id

    // on abonne l’utilisateur au titre
    await utilisateurTitreCreate({ utilisateurId: user.id, titreId })

    return {
      titreId,
      titreEtapeId,
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}
