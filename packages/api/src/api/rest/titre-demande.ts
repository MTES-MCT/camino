import { ITitreEtape, ITitreEntreprise } from '../../types.js'
import { titreCreate, titreGet, titresGet } from '../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { titreEtapeUpsert } from '../../database/queries/titres-etapes.js'

import titreUpdateTask from '../../business/titre-update.js'
import { titreDemarcheUpdate } from '../../business/titre-demarche-update.js'
import titreEtapeUpdateTask from '../../business/titre-etape-update.js'
import { userSuper } from '../../database/user-super.js'
import { User, isBureauDEtudes, isEntreprise } from 'camino-common/src/roles.js'
import { linkTitres } from '../../database/queries/titres-titres.js'
import { getLinkConfig, canCreateTitre } from 'camino-common/src/permissions/titres.js'
import { checkTitreLinks } from '../../business/validations/titre-links-validate.js'
import { utilisateurTitreCreate } from '../../database/queries/utilisateurs.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { EtapeId } from 'camino-common/src/etape.js'
import { titreDemandeValidator } from 'camino-common/src/titres.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { Pool } from 'pg'
import { CaminoRequest, CustomResponse } from './express-type.js'

export const titreDemandeCreer = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<EtapeId>) => {
  const user: User = req.auth

  const titreDemandeParsed = titreDemandeValidator.safeParse(req.body)
  try {
    if (!titreDemandeParsed.success) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    } else {
      const titreDemande = titreDemandeParsed.data
      if (!canCreateTitre(user, titreDemande.typeId) || isNullOrUndefined(user)) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
      } else {
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

        if (isNotNullNorUndefinedNorEmpty(titreDemande.titreFromIds)) {
          const titresFrom = await titresGet({ ids: titreDemande.titreFromIds }, { fields: { id: {} } }, user)

          checkTitreLinks(titreDemande, titreDemande.titreFromIds, titresFrom, [])

          await linkTitres({
            linkTo: titre.id,
            linkFrom: titreDemande.titreFromIds,
          })
        }
        await titreUpdateTask(pool, titre.id)

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

        // if (isBureauDEtudes(user) || isEntreprise(user)) {
        //   let decisionsAnnexesEtapeTypeIds: EtapeTypeId[] = []
        //   if (titreDemande.typeId === 'axm') {
        //     // si c’est une AXM, d’après l’arbre d’instructions il y a 2 décisions annexes
        //     // - la décision du propriétaire du sol (asl)
        //     // - la décision de la mission autorité environnementale (dae)
        //     //FIXME
        //     decisionsAnnexesEtapeTypeIds = ['asl', 'dae']
        //   }
        // }
        const updatedTitreEtape = await titreEtapeUpsert(titreEtape, user, titreId)
        await titreEtapeUpdateTask(pool, updatedTitreEtape.id, titreEtape.titreDemarcheId, user)

        const titreEtapeId = updatedTitreEtape.id

        // on abonne l’utilisateur au titre
        await utilisateurTitreCreate({ utilisateurId: user.id, titreId })

        res.json(titreEtapeId)
      }
    }
  } catch (e) {
    console.error(e)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  }
}
