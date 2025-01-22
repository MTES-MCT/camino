import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { userSuper } from '../../database/user-super'
import { isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { demarcheEnregistrementDemandeDateFind, DemarcheId } from 'camino-common/src/demarche'
import { isEtapeComplete } from 'camino-common/src/permissions/titres-etapes'
import { iTitreEtapeToFlattenEtape } from '../../api/_format/titres-etapes'
import { callAndExit } from '../fp-tools'
import { getDocumentsByEtapeId, getEntrepriseDocumentIdsByEtapeId, getEtapeAvisLargeObjectIdsByEtapeId } from '../../database/queries/titres-etapes.queries'
import { Pool } from 'pg'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { isTitreValide } from 'camino-common/src/static/titresStatuts'
import { titreEtapeGet } from '../../database/queries/titres-etapes'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { ETAPE_HERITAGE_PROPS } from 'camino-common/src/heritage'
import { dateAddMonths, getCurrent, isBefore, setDayInMonth } from 'camino-common/src/date'

const dateEtapeRecente = setDayInMonth(dateAddMonths(getCurrent(), -8), 1)
const etapesValidate = async (pool: Pool, demarcheIds?: DemarcheId[]) => {
  const etapesRecentes = [] as string[]
  const errorsTitresValides = [] as string[]
  const autreErrors = [] as string[]
  const demarches = await titresDemarchesGet(
    { titresDemarchesIds: demarcheIds },
    {
      fields: {
        titre: { id: {} },
        etapes: { id: {} },
      },
    },
    userSuper
  )
  for (const demarche of demarches) {
    const titreTypeId = demarche.titre!.typeId
    const titreStatutId = demarche.titre!.titreStatutId
    if (isNotNullNorUndefinedNorEmpty(demarche.etapes)) {
      try {
        const sortedEtapes = demarche.etapes!.toSorted((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
        const firstEtapeDate = demarcheEnregistrementDemandeDateFind(demarche.etapes)
        for (const etapeSansHeritage of sortedEtapes) {
          let etape = etapeSansHeritage
          if (EtapesTypes[etapeSansHeritage.typeId].fondamentale) {
            if (ETAPE_HERITAGE_PROPS.some(prop => etapeSansHeritage.heritageProps?.[prop].actif ?? false)) {
              const etapeLoaded = await titreEtapeGet(etapeSansHeritage.id, { fetchHeritage: true, fields: { id: {} } }, userSuper)
              if (isNullOrUndefined(etapeLoaded)) {
                throw new Error(`Impossible de récupérer une étape héritée ${etapeSansHeritage.id}`)
              }

              etape = etapeLoaded
            }
          }
          if (etape.isBrouillon === ETAPE_IS_NOT_BROUILLON) {
            const flattenEtape = await callAndExit(iTitreEtapeToFlattenEtape(etape))
            const documents = await callAndExit(
              getDocumentsByEtapeId(
                etape.id,
                pool,
                userSuper,
                async () => titreTypeId,
                async () => [],
                async () => [],
                etape.typeId,
                {
                  demarche_type_id: demarche.typeId,
                  entreprises_lecture: demarche.entreprisesLecture ?? false,
                  public_lecture: demarche.publicLecture ?? false,
                  titre_public_lecture: demarche.titre!.publicLecture ?? false,
                }
              )
            )

            const entrepriseDocuments = await callAndExit(getEntrepriseDocumentIdsByEtapeId({ titre_etape_id: etape.id }, pool, userSuper))
            const etapeAvis = await callAndExit(
              getEtapeAvisLargeObjectIdsByEtapeId(
                etape.id,
                pool,
                userSuper,
                async () => titreTypeId,
                async () => [],
                async () => [],
                etape.typeId,
                {
                  demarche_type_id: demarche.typeId,
                  entreprises_lecture: demarche.entreprisesLecture ?? false,
                  public_lecture: demarche.publicLecture ?? false,
                  titre_public_lecture: demarche.titre!.publicLecture ?? false,
                }
              )
            )
            const { valid, errors } = isEtapeComplete(
              flattenEtape,
              titreTypeId,
              demarche.id,
              demarche.typeId,
              documents,
              entrepriseDocuments,
              etape.sdomZones,
              etape.communes?.map(({ id }) => id) ?? [],
              etapeAvis,
              userSuper,
              firstEtapeDate
            )

            if (!valid) {
              const errorMessage = `https://camino.beta.gouv.fr/etapes/${etape.slug} => etape "${etape.typeId}" : ${errors}`
              if (isBefore(dateEtapeRecente, etape.date)) {
                etapesRecentes.push(errorMessage)
              } else if (isTitreValide(titreStatutId)) {
                errorsTitresValides.push(errorMessage)
              } else {
                autreErrors.push(errorMessage)
              }
            }
          }
        }
      } catch (e) {
        const errorMessage = `${demarche.id} étape invalide =>\n\t${e}`
        if (isTitreValide(titreStatutId)) {
          errorsTitresValides.push(errorMessage)
        } else {
          autreErrors.push(errorMessage)
        }
      }
    }
  }

  return { surTitreValide: errorsTitresValides, autre: autreErrors, etapesRecentes }
}

const MAX_ERRORS_TO_DISPLAY = 20
export const etapesCompletesCheck = async (pool: Pool, demarcheIds?: DemarcheId[]): Promise<{ surTitreValide: string[]; autre: string[]; etapesRecentes: string[] }> => {
  console.info()
  console.info('- - -')
  console.info('vérification de la completion des étapes')
  console.info()

  let errorsNb = 0
  const { surTitreValide, autre, etapesRecentes } = await etapesValidate(pool, demarcheIds)
  etapesRecentes.forEach(e => {
    errorsNb++
    if (errorsNb < MAX_ERRORS_TO_DISPLAY) {
      console.warn(e)
    }
  })

  surTitreValide.forEach(e => {
    errorsNb++
    if (errorsNb < MAX_ERRORS_TO_DISPLAY) {
      console.warn(e)
    }
  })

  autre.forEach(e => {
    errorsNb++
    if (errorsNb < MAX_ERRORS_TO_DISPLAY) {
      console.warn(e)
    }
  })

  if (errorsNb > 0) {
    console.error(
      `erreurs : ${etapesRecentes.length} étapes récentes (après le ${dateEtapeRecente}), ${surTitreValide.length} sur titre valide, ${autre.length} sur le reste. ${etapesRecentes.length + surTitreValide.length + autre.length} en tout`
    )
  }

  return { surTitreValide, autre, etapesRecentes }
}
