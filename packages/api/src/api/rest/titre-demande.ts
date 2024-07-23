import { ITitreEtape } from '../../types'
import { titreCreate, titreGet, titresGet } from '../../database/queries/titres'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches'
import { titreEtapeUpsert } from '../../database/queries/titres-etapes'

import titreUpdateTask from '../../business/titre-update'
import { titreDemarcheUpdate } from '../../business/titre-demarche-update'
import { titreEtapeUpdateTask } from '../../business/titre-etape-update'
import { userSuper } from '../../database/user-super'
import { User, isBureauDEtudes, isEntreprise, isEntrepriseOrBureauDEtude } from 'camino-common/src/roles'
import { linkTitres } from '../../database/queries/titres-titres'
import { getLinkConfig, canCreateTitre } from 'camino-common/src/permissions/titres'
import { checkTitreLinks } from '../../business/validations/titre-links-validate'
import { utilisateurTitreCreate } from '../../database/queries/utilisateurs'
import { toCaminoDate } from 'camino-common/src/date'
import { isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { ETAPE_IS_BROUILLON } from 'camino-common/src/etape'
import { TitreDemandeOutput, titreDemandeValidator } from 'camino-common/src/titres'
import { HTTP_STATUS } from 'camino-common/src/http'
import { Pool } from 'pg'
import { CaminoRequest, CustomResponse } from './express-type'

export const titreDemandeCreer = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<TitreDemandeOutput>) => {
  const user: User = req.auth

  const titreDemandeParsed = titreDemandeValidator.safeParse(req.body)
  try {
    if (!titreDemandeParsed.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      const titreDemande = titreDemandeParsed.data
      if (!canCreateTitre(user, titreDemande.typeId) || isNullOrUndefined(user)) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
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

        // Quand on est une entreprise ou un bureau d'étude, on créer directement la demande
        if (isEntrepriseOrBureauDEtude(user)) {
          const titreEtape: Omit<ITitreEtape, 'id'> = {
            titreDemarcheId,
            typeId: 'mfr',
            statutId: 'fai',
            isBrouillon: ETAPE_IS_BROUILLON,
            date,
            duree: titreDemande.typeId === 'arm' ? 4 : undefined,
            titulaireIds: [titreDemande.entrepriseId],
          }

          const updatedTitreEtape = await titreEtapeUpsert(titreEtape, user, titreId)
          if (isNullOrUndefined(updatedTitreEtape)) {
            console.error("Une erreur est survenue lors de l'insert de l'étape")
            res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          } else {
            await titreEtapeUpdateTask(pool, updatedTitreEtape.id, titreEtape.titreDemarcheId, user)

            const titreEtapeId = updatedTitreEtape.id

            // on abonne l’utilisateur au titre
            await utilisateurTitreCreate({ utilisateurId: user.id, titreId })

            res.json({ etapeId: titreEtapeId })
          }
        } else {
          res.json({ titreId })
        }
      }
    }
  } catch (e) {
    console.error(e)
    res.sendStatus(HTTP_STATUS.FORBIDDEN)
  }
}
