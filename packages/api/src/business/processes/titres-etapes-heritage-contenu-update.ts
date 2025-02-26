import { titreEtapeUpdate } from '../../database/queries/titres-etapes'
import { titreEtapeHeritageContenuFind } from '../utils/titre-etape-heritage-contenu-find'
import { titreEtapesSortAscByOrdre, titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort'
import { UserNotNull } from 'camino-common/src/roles'
import { getSections, Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { DemarcheId } from 'camino-common/src/demarche'
import { Pool } from 'pg'
import { getAllEtapeIds, getDemarches } from './titres-etapes-heritage-contenu-update.queries'
import { EtapeId } from 'camino-common/src/etape'
import { callAndExit } from '../../tools/fp-tools'
import { Effect } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'
import { EffectDbQueryAndValidateErrors } from '../../pg-database'
function isEmpty(obj: any) {
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false
    }
  }

  return true
}
interface ErrorInContenuHeritage {
  etapeIdWithBadHeritage: EtapeId
  unknownEtapeIds: EtapeId[]
}
export const checkEtapeInContenuHeritage = (pool: Pool): Effect.Effect<ErrorInContenuHeritage[], CaminoError<EffectDbQueryAndValidateErrors>> => {
  return Effect.Do.pipe(
    Effect.flatMap(() => getAllEtapeIds(pool)),
    Effect.map(({ ids, etapes }) =>
      etapes.reduce<ErrorInContenuHeritage[]>((acc, etape) => {
        const etapeIdNonExistantes: EtapeId[] = []
        if (isNotNullNorUndefined(etape.heritage_contenu)) {
          for (const key of Object.keys(etape.heritage_contenu)) {
            if (isNotNullNorUndefined(etape.heritage_contenu[key])) {
              for (const second of Object.keys(etape.heritage_contenu[key])) {
                const etapeId = etape.heritage_contenu[key][second].etapeId
                if (isNotNullNorUndefined(etapeId)) {
                  if (!ids.has(etapeId)) {
                    etapeIdNonExistantes.push(etapeId)
                    console.error(`L'étape ${etape.id} hérite son contenu de l'étape ${etapeId} qui n'existe plus l'édition est cassée https://camino.beta.gouv.fr/etapes/${etape.id}`)
                  }
                }
              }
            }
          }
        }

        if (isNotNullNorUndefinedNorEmpty(etapeIdNonExistantes)) {
          acc.push({ etapeIdWithBadHeritage: etape.id, unknownEtapeIds: etapeIdNonExistantes })
        }
        return acc
      }, [])
    )
  )
}
export const titresEtapesHeritageContenuUpdate = async (pool: Pool, user: UserNotNull, demarcheId?: DemarcheId): Promise<{ updated: EtapeId[]; errors: EtapeId[] }> => {
  console.info()
  console.info('héritage des contenus des étapes…')

  const titresDemarches = await callAndExit(getDemarches(pool, demarcheId))

  // lorsqu'une étape est mise à jour par un utilisateur,
  // l'objet heritageContenu reçu ne contient pas d'id d'étape
  // l'étape est donc toujours mise à jour

  const titresEtapesIdsUpdated: EtapeId[] = []
  const titresEtapesIdsErrors: EtapeId[] = []

  for (const titreDemarche of Object.values(titresDemarches)) {
    if (isNotNullNorUndefinedNorEmpty(titreDemarche.etapes)) {
      const etapeSectionsDictionary = titreDemarche.etapes.reduce<{
        [etapeId in EtapeId]?: Section[]
      }>((acc, e) => {
        acc[e.id] = getSections(titreDemarche.titreTypeId, titreDemarche.typeId, e.typeId)

        return acc
      }, {})
      const titreEtapesPerdantLesSections = titreDemarche.etapes.filter(
        etape => (!isEmpty(etape.contenu) || !isEmpty(etape.heritageContenu)) && isNullOrUndefinedOrEmpty(etapeSectionsDictionary[etape.id])
      )

      if (isNotNullNorUndefinedNorEmpty(titreEtapesPerdantLesSections)) {
        for (const etapePerdantLesSections of titreEtapesPerdantLesSections) {
          console.error(`l'étape https://camino.beta.gouv.fr/etapes/${etapePerdantLesSections.id} de type ${etapePerdantLesSections.typeId} possède un contenu alors qu'elle n'est pas censée en avoir`)
          // TODO 2025-02-24 : à décommenter et à lancer en prod, puis à supprimer
          // prettier-ignore
          // await titreEtapeUpdate(etapePerdantLesSections.id, { contenu: null, heritageContenu: null, }, user, titreDemarche.titreId)
          titresEtapesIdsErrors.push(etapePerdantLesSections.id)
        }
      }
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      const titreEtapes = titreEtapesSortAscByOrdre(titreDemarche.etapes.filter(e => etapeSectionsDictionary[e.id]))

      if (isNotNullNorUndefinedNorEmpty(titreEtapes)) {
        for (let index = 0; index < titreEtapes.length; index++) {
          const titreEtape = titreEtapes[index]
          const titreEtapesFiltered = titreEtapesSortDescByOrdre(titreEtapes.slice(0, index))

          const { contenu, heritageContenu, hasChanged } = titreEtapeHeritageContenuFind(titreEtapesFiltered, titreEtape, etapeSectionsDictionary)

          if (hasChanged) {
            await titreEtapeUpdate(
              titreEtape.id,
              {
                contenu,
                heritageContenu,
              },
              user,
              titreDemarche.titreId
            )

            console.info('titre / démarche / étape : héritage du contenu (mise à jour) ->', titreEtape.id)

            titresEtapesIdsUpdated.push(titreEtape.id)

            titreEtape.contenu = contenu ?? null
            titreEtape.heritageContenu = heritageContenu ?? null
          }
        }
      }
    }
  }

  return { updated: titresEtapesIdsUpdated, errors: titresEtapesIdsErrors }
}
