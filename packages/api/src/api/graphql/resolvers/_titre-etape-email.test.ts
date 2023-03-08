import { emailsForAdministrationsGet } from './_titre-etape-email.js'
import { userSuper } from '../../../database/user-super.js'
import { expect, test } from 'vitest'
import { UserNotNull } from 'camino-common/src/roles.js'

test('envoie un email sur une étape non existante', () => {
  const actual = emailsForAdministrationsGet(undefined, undefined, '', '', '', userSuper, undefined)

  expect(actual).toBe(null)
})

const user: UserNotNull = {
  id: 'super',
  email: 'camino@beta.gouv.fr',
  nom: 'Camino',
  prenom: '',
  role: 'super',
}

test("envoie un email sur un octroi d'AEX", () => {
  const actual = emailsForAdministrationsGet(
    {
      typeId: 'mfr',
      statutId: 'fai',
    },
    { nom: 'demande' },
    'oct',
    'titreId',
    'axm',
    user,
    undefined
  )

  expect(actual).toMatchSnapshot()
})

test("envoie un email sur un octroi d'ARM", () => {
  const actual = emailsForAdministrationsGet(
    {
      typeId: 'mdp',
      statutId: 'fai',
    },
    { nom: 'dépôt de la demande' },
    'oct',
    'titreId',
    'arm',
    user,
    undefined
  )

  expect(actual).toMatchSnapshot()
})
