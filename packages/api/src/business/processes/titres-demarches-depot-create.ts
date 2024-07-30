import type { ITitreDemarche, ITitreEtape } from '../../types'

import { titreEtapeUpsert } from '../../database/queries/titres-etapes'
import { titreDemarcheGet } from '../../database/queries/titres-demarches'
import { userSuper } from '../../database/user-super'
import { titreEtapeUpdateTask } from '../titre-etape-update'
import { titreEtapeAdministrationsEmailsSend } from '../../api/graphql/resolvers/_titre-etape-email'
import { demarcheDefinitionFind } from '../rules-demarches/definitions'
import { titreUrlGet } from '../utils/urls-get'
import { emailsWithTemplateSend } from '../../tools/api-mailjet/emails'
import { EmailTemplateId, EmailAdministration } from '../../tools/api-mailjet/types'
import { getCurrent } from 'camino-common/src/date'
import type { Pool } from 'pg'
import { getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { NonEmptyArray, isNonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { getEntreprise, getEntrepriseUtilisateurs } from '../../api/rest/entreprises.queries'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'

const emailConfirmationDepotSend = async (
  emails: string[],
  params: {
    titreTypeNom: string
    titulaireNom: string
    titreUrl: string
    titreNom: string
  }
): Promise<void> => {
  await emailsWithTemplateSend(emails, EmailTemplateId.DEMARCHE_CONFIRMATION_DEPOT, {
    ...params,
    emailDGTM: EmailAdministration.DGTM,
  })
}

// envoie un email de confirmation à l’opérateur
const titreEtapeDepotConfirmationEmailsSend = async (titreDemarche: ITitreDemarche, titulaires: { nom: string; emails: NonEmptyArray<string> }[]) => {
  const titreUrl = titreUrlGet(titreDemarche.titreId)
  const titreNom = titreDemarche.titre!.nom
  const titreTypeNom = TitresTypesTypes[getTitreTypeType(titreDemarche.titre!.typeId)].nom

  for (const titulaire of titulaires) {
    await emailConfirmationDepotSend(titulaire.emails, {
      titreTypeNom,
      titulaireNom: titulaire.nom ?? '',
      titreUrl,
      titreNom,
    })
  }
}

// visibleForTesting
export const titreDemarcheDepotCheck = (titreDemarche: ITitreDemarche): boolean => {
  const demarcheDefinition = demarcheDefinitionFind(titreDemarche.titre!.typeId, titreDemarche.typeId, titreDemarche.etapes, titreDemarche.id)
  // On peut déposer automatiquement seulement les démarches qui possèdent une machine
  if (!demarcheDefinition) return false
  if (titreDemarche.titre!.typeId === 'arm' && titreDemarche.typeId === 'oct') {
    // Si on a pas de demande faite
    if (!titreDemarche.etapes?.find(e => e.typeId === 'mfr' && e.isBrouillon === ETAPE_IS_NOT_BROUILLON)) {
      return false
    }

    // Si on a déjà un dépot de la demande
    return !titreDemarche.etapes?.find(e => e.typeId === 'mdp')
  }

  return false
}

const titreEtapeDepotCreate = async (pool: Pool, titreDemarche: ITitreDemarche) => {
  let titreEtapeDepot: ITitreEtape | undefined = {
    titreDemarcheId: titreDemarche.id,
    typeId: 'mdp',
    statutId: 'fai',
    date: getCurrent(),
  } as ITitreEtape

  titreEtapeDepot = await titreEtapeUpsert(titreEtapeDepot, userSuper, titreDemarche.titreId)
  if (isNullOrUndefined(titreEtapeDepot)) {
    throw new Error("Une erreur est survenue lors de la mise à jour d'une étape")
  }
  await titreEtapeUpdateTask(pool, titreEtapeDepot.id, titreEtapeDepot.titreDemarcheId, userSuper)
  await titreEtapeAdministrationsEmailsSend(titreEtapeDepot, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre!.typeId, userSuper)

  const titulaireIds = titreDemarche.titre?.titulaireIds

  if (isNotNullNorUndefinedNorEmpty(titulaireIds)) {
    const titulaires: { nom: string; emails: NonEmptyArray<string> }[] = []
    for (const titulaireId of titulaireIds) {
      const entreprise = await getEntreprise(pool, titulaireId)
      if (isNotNullNorUndefined(entreprise)) {
        const utilisateurs = await getEntrepriseUtilisateurs(pool, titulaireId)

        const emails = utilisateurs.map(({ email }) => email).filter((email): email is string => isNotNullNorUndefinedNorEmpty(email))
        if (isNonEmptyArray(emails)) {
          titulaires.push({ nom: entreprise.nom, emails })
        }
      }
    }

    await titreEtapeDepotConfirmationEmailsSend(titreDemarche, titulaires)
  }
}
export const titresEtapesDepotCreate = async (pool: Pool, demarcheId: string): Promise<boolean> => {
  console.info()
  console.info('dépôt d’une démarche…')

  const titreDemarche = await titreDemarcheGet(
    demarcheId,
    {
      fields: {
        etapes: { id: {} },
        titre: {
          titulairesEtape: { id: {} },
        },
      },
    },
    userSuper
  )

  if (!titreDemarche) {
    return false
  }

  const depotCheck = titreDemarcheDepotCheck(titreDemarche)
  if (depotCheck) {
    await titreEtapeDepotCreate(pool, titreDemarche)
  }

  return depotCheck
}
