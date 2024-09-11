import { titreEtapeUpdate } from '../../database/queries/titres-etapes'
import { titreEtapeHeritageContenuFind } from '../utils/titre-etape-heritage-contenu-find'
import { titreEtapesSortAscByOrdre, titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort'
import { UserNotNull } from 'camino-common/src/roles'
import { getSections, Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { DeepReadonly, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { DemarcheId } from 'camino-common/src/demarche'
import { Pool } from 'pg'
import { getDemarches } from './titres-etapes-heritage-contenu-update.queries'

export const titresEtapesHeritageContenuUpdate = async (pool: Pool, user: DeepReadonly<UserNotNull>, demarcheId?: DemarcheId): Promise<string[]> => {
  console.info()
  console.info('héritage des contenus des étapes…')

  const titresDemarches = await getDemarches(pool, demarcheId)

  // lorsqu'une étape est mise à jour par un utilisateur,
  // l'objet heritageContenu reçu ne contient pas d'id d'étape
  // l'étape est donc toujours mise à jour

  const titresEtapesIdsUpdated = [] as string[]

  for (const titreDemarche of Object.values(titresDemarches)) {
    if (titreDemarche.etapes?.length) {
      const etapeSectionsDictionary = titreDemarche.etapes.reduce<{
        [etapeId: string]: DeepReadonly<Section[]>
      }>((acc, e) => {
        acc[e.id] = getSections(titreDemarche.titreTypeId, titreDemarche.typeId, e.typeId)

        return acc
      }, {})
      const titreEtapes = titreEtapesSortAscByOrdre(titreDemarche.etapes?.filter(e => etapeSectionsDictionary[e.id]) ?? [])

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

  return titresEtapesIdsUpdated
}
