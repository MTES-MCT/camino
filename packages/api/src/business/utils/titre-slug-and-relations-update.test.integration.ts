import { titreSlugAndRelationsUpdate } from './titre-slug-and-relations-update'
import { titreGet } from '../../database/queries/titres'
import { userSuper } from '../../database/user-super'
import { dbManager } from '../../../tests/db-manager'
import { ITitre } from '../../types'
import Titres from '../../database/models/titres'
import { objectClone } from '../../tools/index'
import { expect, test, describe, afterAll, beforeAll } from 'vitest'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { insertTitreGraph } from '../../../tests/integration-test-helper'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { newDemarcheId, newTitreId } from '../../database/models/_format/id-create'
import { demarcheSlugValidator } from 'camino-common/src/demarche'
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

const titreAdd = async (titre: ITitre): Promise<ITitre> => {
  await insertTitreGraph(titre)
  const savedTitre = await titreGet(
    titre.id,
    {
      fields: {
        demarches: {
          etapes: {
            id: {},
          },
        },
        activites: { id: {} },
      },
    },
    userSuper
  )

  if (isNullOrUndefined(savedTitre)) {
    throw new Error('on a pas réussi à sauvegarder le titre')
  }

  return savedTitre
}

describe('vérifie la mis à jour des slugs sur les relations d’un titre', () => {
  test('met à jour le slug d’un nouveau titre', async () => {
    await Titres.query().delete()

    const titre = await titreAdd({
      id: newTitreId(),
      nom: 'titre-nom',
      typeId: 'arm',
      titreStatutId: 'ech',
      propsTitreEtapesIds: {},
      slug: titreSlugValidator.parse('toto'),
    })

    const { hasChanged, slug } = await titreSlugAndRelationsUpdate(titre)
    expect(hasChanged).toEqual(true)
    expect(slug).toEqual('m-ar-titre-nom-0000')

    const titreDb = await titreGet(titre.id, { fields: {} }, userSuper)
    expect(titreDb!.slug).toEqual(slug)
  })

  test('ne met pas à jour le slug d’un titre existant', async () => {
    await Titres.query().delete()

    const titre = await titreAdd({
      id: newTitreId(),
      nom: 'titre-nom',
      typeId: 'arm',
      titreStatutId: 'ech',
      propsTitreEtapesIds: {},
      slug: titreSlugValidator.parse('m-ar-titre-nom-0000'),
    })

    const { hasChanged, slug } = await titreSlugAndRelationsUpdate(titre)
    expect(hasChanged).toEqual(false)
    expect(slug).toEqual(titre.slug)

    const titreDb = await titreGet(titre.id, { fields: {} }, userSuper)
    expect(titreDb!.slug).toEqual(slug)
  })

  test('génère un slug différent si le slug existe déjà', async () => {
    await Titres.query().delete()

    const titrePojo: ITitre = {
      id: newTitreId(),
      nom: 'titre-nom',
      typeId: 'arm',
      titreStatutId: 'ech',
      propsTitreEtapesIds: {},
    }

    let titre = await titreAdd(objectClone(titrePojo))
    const { slug: firstSlug } = await titreSlugAndRelationsUpdate(titre)
    titre = await titreAdd({ ...titrePojo, id: newTitreId() })

    const { hasChanged, slug: secondSlug } = await titreSlugAndRelationsUpdate(titre)
    expect(hasChanged).toEqual(true)
    expect(secondSlug).not.toEqual(firstSlug)
    expect(secondSlug.startsWith(firstSlug)).toBeTruthy()
  })

  test('ne modifie pas le hash d’un slug déjà en double', async () => {
    await Titres.query().delete()

    const titrePojo: ITitre = {
      id: newTitreId(),
      nom: 'titre-nom',
      typeId: 'arm',
      titreStatutId: 'ech',
      propsTitreEtapesIds: {},
    }

    let titre = await titreAdd(objectClone(titrePojo))
    const firstTitreId = titre.id
    const { slug: firstSlug } = await titreSlugAndRelationsUpdate(titre)
    titre = await titreAdd({ ...titrePojo, id: newTitreId(), slug: titreSlugValidator.parse(`${firstSlug}-123123`) })

    const { hasChanged, slug: secondSlug } = await titreSlugAndRelationsUpdate(titre)
    expect(hasChanged).toEqual(true)
    expect(secondSlug).toEqual(`${firstSlug}-123123`)

    const savedTitre = await titreGet(titre.id, { fields: { id: {} } }, userSuper)
    expect(savedTitre?.doublonTitreId).toEqual(firstTitreId)
  })

  test('génère un slug pour une démarche', async () => {
    await Titres.query().delete()
    const id = newTitreId()
    const titre = await titreAdd({
      nom: 'titre-nom',
      id,
      typeId: 'arm',
      titreStatutId: 'ech',
      propsTitreEtapesIds: {},
      slug: titreSlugValidator.parse('m-ar-titre-nom-0000'),
      demarches: [
        {
          id: newDemarcheId(),
          titreId: id,
          typeId: 'oct',
          statutId: 'dep',
          slug: demarcheSlugValidator.parse('slug'),
        },
      ],
    })

    const { slug, hasChanged } = await titreSlugAndRelationsUpdate(titre)

    expect(hasChanged).toEqual(true)
    expect(slug).toEqual(titre.slug)

    const titreDb = await titreGet(titre.id, { fields: { demarches: { id: {} } } }, userSuper)
    expect(titreDb!.slug).toEqual(slug)
    expect(titreDb!.demarches![0].slug).toEqual('m-ar-titre-nom-0000-oct01')
  })
})
