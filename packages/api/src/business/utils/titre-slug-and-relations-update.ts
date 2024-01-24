import { ITitre, ITitreActivite, ITitreDemarche, ITitreEtape} from '../../types.js'

import { DemarcheId } from 'camino-common/src/demarche.js'

import { titreDemarcheSortAsc } from './titre-elements-sort-asc.js'
import { titreEtapesSortAscByOrdre } from './titre-etapes-sort.js'
import titreDemarcheOctroiDateDebutFind from '../rules/titre-demarche-octroi-date-debut-find.js'
import { titresGet, titreUpdate } from '../../database/queries/titres.js'
import { userSuper } from '../../database/user-super.js'
import { titreDemarcheUpdate } from '../../database/queries/titres-demarches.js'
import { titreEtapeUpdate } from '../../database/queries/titres-etapes.js'
import { titreActiviteUpdate } from '../../database/queries/titres-activites.js'
import { UserNotNull } from 'camino-common/src/roles'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes.js'
import { slugify } from 'camino-common/src/strings.js'
import { TitreId, TitreSlug, titreSlugValidator } from 'camino-common/src/validators/titres.js'
import { idGenerate } from '../../database/models/_format/id-create.js'
import { ActiviteId } from 'camino-common/src/activite.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'

const titreSlugFind = (titre: ITitre): TitreSlug => {
  const { typeId, nom } = titre
  const demarcheOctroiDateDebut = titreDemarcheOctroiDateDebutFind(titre.demarches)

  return titreSlugValidator.parse(slugify(`${getDomaineId(typeId)}-${getTitreTypeType(typeId)}-${nom}-${demarcheOctroiDateDebut.slice(0, 4)}`))
}

const titreDemarcheSlugFind = (titreDemarche: ITitreDemarche, titre: ITitre) => {
  const titreDemarcheTypeOrder = titreDemarcheSortAsc(titre.demarches!.filter(d => d.typeId === titreDemarche.typeId)).findIndex(d => d === titreDemarche) + 1

  return `${titre.slug}-${titreDemarche.typeId}${titreDemarcheTypeOrder.toString().padStart(2, '0')}`
}

const titreDemarcheEtapeSlugFind = (titreEtape: ITitreEtape, titreDemarche: ITitreDemarche) => titreEtapeSlugFind(titreEtape, titreDemarche, titreDemarche.etapes!)

const titreEtapeSlugFind = (titreEtape: ITitreEtape, titreDemarche: ITitreDemarche, etapes: ITitreEtape[]) => {
  const titreEtapeTypeOrder = titreEtapesSortAscByOrdre(etapes.filter(e => e.typeId === titreEtape.typeId)).findIndex(e => e === titreEtape) + 1

  return `${titreDemarche.slug}-${titreEtape.typeId}${titreEtapeTypeOrder.toString().padStart(2, '0')}`
}

const titreActiviteSlugFind = (titreActivite: ITitreActivite, titre: ITitre) => `${titre.slug}-${titreActivite.typeId}-${titreActivite.annee}-${titreActivite.periodeId.toString().padStart(2, '0')}`

interface ITitreRelation<T extends string | DemarcheId = string> {
  name: string
  slugFind: (...args: any[]) => string
  update: ((id: T, element: { slug: string }, user: UserNotNull) => Promise<{ id: T }>) | ((id: T, element: { slug: string }, user: UserNotNull, titreId: TitreId) => Promise<{ id: T }>)
  relations?: ITitreRelation[]
}

const titreRelations: (ITitreRelation<DemarcheId> | ITitreRelation<ActiviteId> | ITitreRelation)[] = [
  {
    name: 'demarches',
    slugFind: titreDemarcheSlugFind,
    // @ts-ignore 2023-11-06 il faut retravailler ça
    update: titreDemarcheUpdate,
    relations: [
      {
        name: 'etapes',
        slugFind: titreDemarcheEtapeSlugFind,
        // @ts-ignore
        update: titreEtapeUpdate,
      },
    ],
  },
  {
    name: 'activites',
    update: titreActiviteUpdate,
    slugFind: titreActiviteSlugFind,
  },
]

const relationsSlugsUpdate = async (parent: any, relations: (ITitreRelation<DemarcheId> | ITitreRelation<ActiviteId> | ITitreRelation)[], titreId: TitreId): Promise<boolean> => {
  let hasChanged = false
  for (const relation of relations) {
    for (const element of parent[relation.name]) {
      const slug = relation.slugFind(element, parent)
      if (slug !== element.slug) {
        await relation.update(element.id, { slug }, userSuper, titreId)
        hasChanged = true
      }
      if (relation.relations) {
        hasChanged = (await relationsSlugsUpdate({ ...element, slug }, relation.relations, titreId)) || hasChanged
      }
    }
  }

  return hasChanged
}

export const titreSlugAndRelationsUpdate = async (titre: ITitre): Promise<{ hasChanged: boolean; slug: TitreSlug }> => {
  let slug = titreSlugFind(titre)
  let doublonTitreId: string | null = null
  let hasChanged = false

  const titreWithTheSameSlug = await titresGet({ slugs: [slug] }, { fields: { id: {} } }, userSuper)

  if (titreWithTheSameSlug?.length > 1 || (titreWithTheSameSlug?.length === 1 && titreWithTheSameSlug[0].id !== titre.id)) {
    if (isNotNullNorUndefined(titre.slug) && titre.slug.startsWith(slug)) {
      slug = titre.slug
    } else {
      slug = titreSlugValidator.parse(`${slug}-${idGenerate(8)}`)
      doublonTitreId = titreWithTheSameSlug[0].id
    }
  }

  if (titre.slug !== slug) {
    await titreUpdate(titre.id, { slug, doublonTitreId })
    hasChanged = true
  }

  hasChanged = (await relationsSlugsUpdate({ ...titre, slug }, titreRelations, titre.id)) || hasChanged

  return { hasChanged, slug }
}
