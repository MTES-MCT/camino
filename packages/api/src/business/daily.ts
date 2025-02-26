import { titresActivitesStatutIdsUpdate } from './processes/titres-activites-statut-ids-update'
import { titresActivitesUpdate } from './processes/titres-activites-update'
import { titresDemarchesOrdreUpdate } from './processes/titres-demarches-ordre-update'
import { titresDemarchesPublicUpdate } from './processes/titres-demarches-public-update'
import { titresDemarchesStatutIdUpdate } from './processes/titres-demarches-statut-ids-update'
import { titresEtapesAdministrationsLocalesUpdate } from './processes/titres-etapes-administrations-locales-update'
import { titresEtapesOrdreUpdate } from './processes/titres-etapes-ordre-update'
import { titresDemarchesDatesUpdate } from './processes/titres-phases-update'
import { titresPublicUpdate } from './processes/titres-public-update'
import { titresPropsEtapesIdsUpdate } from './processes/titres-props-etapes-ids-update'
import { titresStatutIdsUpdate } from './processes/titres-statut-ids-update'
import { titresEtapesHeritagePropsUpdate } from './processes/titres-etapes-heritage-props-update'
import { checkEtapeInContenuHeritage, titresEtapesHeritageContenuUpdate } from './processes/titres-etapes-heritage-contenu-update'
import { titresActivitesPropsUpdate } from './processes/titres-activites-props-update'
import { TitreSlugUpdate, titresSlugsUpdate } from './processes/titres-slugs-update'
import { userSuper } from '../database/user-super'
import { titresActivitesRelanceSend } from './processes/titres-activites-relance-send'
import type { Pool } from 'pg'
import { demarchesDefinitionsCheck } from '../tools/demarches/definitions-check'
import { titreTypeDemarcheTypeEtapeTypeCheck } from '../tools/demarches/tde-check'
import { titresEtapesStatutUpdate } from './processes/titres-etapes-statut-update'
import { callAndExit } from '../tools/fp-tools'
import { allEtapesMiseEnConcurrenceUpdate } from './processes/titres-etapes-mise-en-concurrence'
import { etapesFondamentaleIdUpdateForAll } from './processes/titres-etapes-fondamentale-id-update'
import { allEtapesConsentementUpdate } from './processes/titres-etapes-consentement'
import { etapesCompletesCheck } from '../tools/etapes/etapes-complete-check'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, NonEmptyArray } from 'camino-common/src/typescript-tools'
import { config } from '../config'
import { createReadStream, createWriteStream, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { fetch } from 'undici'
import { mailjetSend } from '../tools/api-mailjet/emails'
import { EtapeId } from 'camino-common/src/etape'

interface Daily {
  heritageWithUnknownEtapes: unknown[]
  etapesCompletesErreurs: { surTitreValide: string[]; autre: string[]; etapesRecentes: string[] }
  tdeErreurs: number
  demarcheDefinitionsErreurs: number
  fondamentaleIdUpdated: number
  consentementUpdated: unknown[]
  misesEnConcurrenceUpdated: unknown[]
  titresEtapesStatusUpdated: string[]
  titresEtapesOrdreUpdated: string[]
  titresEtapesHeritagePropsUpdated: string[]
  titresEtapesHeritageContenuUpdated: {
    updated: EtapeId[]
    errors: EtapeId[]
  }
  titresDemarchesStatutUpdated: string[]
  titresDemarchesPublicUpdated: string[]
  titresDemarchesOrdreUpdated: string[]
  titresStatutIdUpdated: string[]
  titresPublicUpdated: string[]
  titresDemarchesDatesUpdated: string[]
  titresEtapesAdministrationsLocalesUpdated: string[]
  titresPropsEtapesIdsUpdated: string[]
  titresActivitesCreated: string[]
  titresActivitesRelanceSent: string[]
  titresActivitesStatutIdsUpdated: string[]
  titresActivitesPropsUpdated: string[]
  titresUpdatedIndex: TitreSlugUpdate[]
}

// Mis à jour le 2025-02-26
const NOMBRE_ERREURS_ETAPES = 10870 as const

type DailyResult = { changes: false } | { changes: true; logs: NonEmptyArray<string> }
const dailyResult = (daily: Daily | null): DailyResult => {
  if (daily === null) {
    return { changes: true, logs: ['Une erreur est survenue durant le daily'] }
  }
  const logs: string[] = []
  if (isNotNullNorUndefined(daily.etapesCompletesErreurs)) {
    if (daily.etapesCompletesErreurs.etapesRecentes.length + daily.etapesCompletesErreurs.surTitreValide.length + daily.etapesCompletesErreurs.surTitreValide.length > NOMBRE_ERREURS_ETAPES) {
      logs.push("ATTENTION IL Y'A DE NOUVELLES ÉTAPES INCOMPLÈTES")
      if (daily.etapesCompletesErreurs.etapesRecentes.length > 0) {
        logs.push(`${daily.etapesCompletesErreurs.etapesRecentes.length} étapes récentes ne sont pas complètes`)
      }
      if (daily.etapesCompletesErreurs.surTitreValide.length > 0) {
        logs.push(`${daily.etapesCompletesErreurs.surTitreValide.length} étapes sur des titres valides ne sont pas complètes`)
      }
      if (daily.etapesCompletesErreurs.surTitreValide.length > 0) {
        logs.push(`${daily.etapesCompletesErreurs.autre.length} étapes sur des titres non valides ne sont pas complètes`)
      }
    }
  }

  if (isNotNullNorUndefinedNorEmpty(daily.heritageWithUnknownEtapes)) {
    logs.push(`${daily.heritageWithUnknownEtapes.length} heritage de contenu qui pointe sur des étapes non existantes`)
  }
  if (isNotNullNorUndefined(daily.tdeErreurs) && daily.tdeErreurs > 0) {
    logs.push(`${daily.tdeErreurs} erreurs TDE`)
  }

  if (isNotNullNorUndefined(daily.demarcheDefinitionsErreurs) && daily.demarcheDefinitionsErreurs > 0) {
    logs.push(`${daily.demarcheDefinitionsErreurs} erreurs sur les définitions des démarches`)
  }

  if (isNotNullNorUndefined(daily.fondamentaleIdUpdated) && daily.fondamentaleIdUpdated > 0) {
    logs.push(`mise à jour: ${daily.fondamentaleIdUpdated} étapes(s) (fondamentale)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.consentementUpdated)) {
    logs.push(`mise à jour: ${daily.consentementUpdated.length} étapes(s) (consentement)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.misesEnConcurrenceUpdated)) {
    logs.push(`mise à jour: ${daily.misesEnConcurrenceUpdated.length} étapes(s) (concurrence)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresEtapesStatusUpdated)) {
    logs.push(`mise à jour: ${daily.titresEtapesStatusUpdated.length} étape(s) (statut)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresEtapesOrdreUpdated)) {
    logs.push(`mise à jour: ${daily.titresEtapesOrdreUpdated.length} étape(s) (ordre)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresEtapesHeritagePropsUpdated)) {
    logs.push(`mise à jour: ${daily.titresEtapesHeritagePropsUpdated.length} étape(s) (héritage des propriétés)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresEtapesHeritageContenuUpdated.updated)) {
    logs.push(`mise à jour: ${daily.titresEtapesHeritageContenuUpdated.updated.length} étape(s) (héritage du contenu)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresEtapesHeritageContenuUpdated.errors)) {
    logs.push(`erreurs: ${daily.titresEtapesHeritageContenuUpdated.errors.length} étape(s) (héritage du contenu) en erreur`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresDemarchesStatutUpdated)) {
    logs.push(`mise à jour: ${daily.titresDemarchesStatutUpdated.length} démarche(s) (statut)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresDemarchesPublicUpdated)) {
    logs.push(`mise à jour: ${daily.titresDemarchesPublicUpdated.length} démarche(s) (publicité)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresDemarchesOrdreUpdated)) {
    logs.push(`mise à jour: ${daily.titresDemarchesOrdreUpdated.length} démarche(s) (ordre)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresStatutIdUpdated)) {
    logs.push(`mise à jour: ${daily.titresStatutIdUpdated.length} titre(s) (statuts)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresPublicUpdated)) {
    logs.push(`mise à jour: ${daily.titresPublicUpdated.length} titre(s) (publicité)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresDemarchesDatesUpdated)) {
    logs.push(`mise à jour: ${daily.titresDemarchesDatesUpdated.length} titre(s) (phases mises à jour)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresEtapesAdministrationsLocalesUpdated)) {
    logs.push(`mise à jour: ${daily.titresEtapesAdministrationsLocalesUpdated.length} administration(s) locale(s) modifiée(s) dans des étapes`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresPropsEtapesIdsUpdated)) {
    logs.push(`mise à jour: ${daily.titresPropsEtapesIdsUpdated.length} titres(s) (propriétés-étapes)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresActivitesCreated)) {
    logs.push(`mise à jour: ${daily.titresActivitesCreated.length} activité(s) créée(s)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresActivitesRelanceSent)) {
    logs.push(`mise à jour: ${daily.titresActivitesRelanceSent.length} activité(s) relancée(s)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresActivitesStatutIdsUpdated)) {
    logs.push(`mise à jour: ${daily.titresActivitesStatutIdsUpdated.length} activité(s) fermée(s)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresActivitesPropsUpdated)) {
    logs.push(`mise à jour: ${daily.titresActivitesPropsUpdated.length} activité(s) (propriété suppression)`)
  }

  if (isNotNullNorUndefinedNorEmpty(daily.titresUpdatedIndex)) {
    logs.push(`mise à jour: ${daily.titresUpdatedIndex.length} titre(s) (slugs)`)
  }

  if (isNotNullNorUndefinedNorEmpty(logs)) {
    return { changes: true, logs }
  }
  return { changes: false }
}

export const daily = async (pool: Pool, logFile: string): Promise<void> => {
  const output = createWriteStream(logFile, { flush: true, autoClose: true })

  // Réinitialise les logs qui seront envoyés par email
  writeFileSync(logFile, '')
  let resume: DailyResult = { changes: true, logs: ["Le daily ne s'est pas lancé"] }
  try {
    resume = await rawDaily(pool)
  } catch (e) {
    console.error('Erreur durant le daily', e)
  }

  if (isNotNullNorUndefined(config().CAMINO_STAGE)) {
    await new Promise<void>(resolve => {
      output.end(() => resolve())
    })
    const emailBody = `Résultats de ${config().ENV} \n${resume.changes ? resume.logs.join('\n') : 'Pas de changement\n'}\n${readFileSync(logFile).toString()}`
    try {
      const tchapHook = config().TCHAP_HOOK
      if (isNotNullNorUndefined(tchapHook)) {
        const markdown = await transformIntoMarkDown(resume, logFile)
        await tchapSend(markdown, tchapHook)
      }
    } catch (e: unknown) {
      let errorMessage = "Une erreur s'est produite pendant l'envoi du daily sur tchap"
      if (e instanceof Error) {
        errorMessage += `-> ${e.message}`
      }
      console.error(errorMessage)
    }

    // TODO 2024-12-05 enlever le daily par email si il s'est bien envoyé via tchap
    await mailjetSend([config().ADMIN_EMAIL], {
      Subject: `[Camino][${config().ENV}] Résultats du daily`,
      TextPart: emailBody,
    })
  }
}
const rawDaily = async (pool: Pool): Promise<DailyResult> => {
  try {
    console.info()
    console.info('- - -')
    console.info('mise à jour quotidienne')

    const titresEtapesStatusUpdated = await titresEtapesStatutUpdate(pool)

    const misesEnConcurrenceUpdated = await callAndExit(allEtapesMiseEnConcurrenceUpdate(pool))
    const consentementUpdated = await callAndExit(allEtapesConsentementUpdate(pool))
    const titresEtapesOrdreUpdated = await titresEtapesOrdreUpdate(pool, userSuper)
    const fondamentaleIdUpdated = await callAndExit(etapesFondamentaleIdUpdateForAll(pool))
    const titresEtapesHeritagePropsUpdated = await titresEtapesHeritagePropsUpdate(userSuper)
    const titresEtapesHeritageContenuUpdated = await titresEtapesHeritageContenuUpdate(pool, userSuper)
    const heritageWithUnknownEtapes = await callAndExit(checkEtapeInContenuHeritage(pool))

    const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate(pool)
    const titresDemarchesOrdreUpdated = await titresDemarchesOrdreUpdate()
    const titresDemarchesDatesUpdated = await titresDemarchesDatesUpdate(pool)
    const titresDemarchesPublicUpdated = await titresDemarchesPublicUpdate()

    const titresStatutIdUpdated = await titresStatutIdsUpdate()
    const titresPublicUpdated = await titresPublicUpdate(pool)
    const titresEtapesAdministrationsLocalesUpdated = await titresEtapesAdministrationsLocalesUpdate()
    const titresPropsEtapesIdsUpdated = await titresPropsEtapesIdsUpdate()

    const titresActivitesCreated = await titresActivitesUpdate(pool)
    const titresActivitesRelanceSent = await titresActivitesRelanceSend(pool)
    const titresActivitesStatutIdsUpdated = await titresActivitesStatutIdsUpdate()
    const titresActivitesPropsUpdated = await titresActivitesPropsUpdate()
    const titresUpdatedIndex = await titresSlugsUpdate()

    const demarcheDefinitionsErreurs = await demarchesDefinitionsCheck()
    const tdeErreurs = await titreTypeDemarcheTypeEtapeTypeCheck()
    const etapesCompletesErreurs = await etapesCompletesCheck(pool)

    return dailyResult({
      heritageWithUnknownEtapes,
      etapesCompletesErreurs: etapesCompletesErreurs,
      tdeErreurs,
      demarcheDefinitionsErreurs,
      fondamentaleIdUpdated,
      consentementUpdated,
      misesEnConcurrenceUpdated,
      titresEtapesStatusUpdated,
      titresEtapesOrdreUpdated,
      titresEtapesHeritagePropsUpdated,
      titresEtapesHeritageContenuUpdated,
      titresDemarchesStatutUpdated,
      titresDemarchesPublicUpdated,
      titresDemarchesOrdreUpdated,
      titresStatutIdUpdated,
      titresPublicUpdated,
      titresDemarchesDatesUpdated,
      titresEtapesAdministrationsLocalesUpdated: titresEtapesAdministrationsLocalesUpdated.map(({ titreEtapeId }) => titreEtapeId),
      titresPropsEtapesIdsUpdated,
      titresActivitesCreated,
      titresActivitesRelanceSent,
      titresActivitesStatutIdsUpdated,
      titresActivitesPropsUpdated,
      titresUpdatedIndex,
    })
  } catch (e) {
    console.info('erreur:', e)

    throw e
  }
}

const transformIntoMarkDown = async (resume: DailyResult, logFile: string): Promise<string> => {
  const fileStream = createReadStream(logFile)

  const readLine = createInterface(fileStream)
  let detail = ''
  const summary = resume.changes ? resume.logs.map(line => `\n* ${line}`).join('') : ''

  for await (const line of readLine) {
    detail += `\n${line}`
  }
  return `### Résultat du daily de ${config().ENV}
${
  summary !== ''
    ? `<details>
    <summary>Résumé du daily</summary>
${summary}
</details>`
    : '**Pas de changement**'
}
<details>
    <summary>Détail du daily</summary>

\`\`\`bash
${detail}
\`\`\`

</details>`
  fileStream.close()
}

const tchapSend = async (markdown: string, url: string): Promise<void> => {
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ message: markdown, message_format: 'markdown' }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
}
