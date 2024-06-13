import { emailsForAdministrationsGet } from './_titre-etape-email.js'
import { userSuper } from '../../../database/user-super.js'
import { expect, test } from 'vitest'
import { UserNotNull } from 'camino-common/src/roles.js'
import { newUtilisateurId } from '../../../database/models/_format/id-create.js'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape.js'

test('envoie un email sur une étape non existante', () => {
  const actual = emailsForAdministrationsGet(undefined, '', '', '', userSuper, undefined)

  expect(actual).toBe(null)
})

const user: UserNotNull = {
  id: newUtilisateurId('super'),
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
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
    },
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
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
    },
    'oct',
    'titreId',
    'arm',
    user,
    undefined
  )

  expect(actual).toMatchSnapshot()
})
