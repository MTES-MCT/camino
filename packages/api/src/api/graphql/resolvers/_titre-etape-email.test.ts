import { emailsForAdministrationsGet } from './_titre-etape-email'
import { userSuper } from '../../../database/user-super'
import { expect, test } from 'vitest'
import { UserNotNull } from 'camino-common/src/roles'
import { newUtilisateurId } from '../../../database/models/_format/id-create'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { titreIdValidator } from 'camino-common/src/validators/titres'

test('envoie un email sur une étape non existante', () => {
  const actual = emailsForAdministrationsGet(undefined, '', titreIdValidator.parse('titreId'), 'arm', userSuper, undefined)

  expect(actual).toBe(null)
})

const user: UserNotNull = {
  id: newUtilisateurId('super'),
  email: 'camino@beta.gouv.fr',
  nom: 'Camino',
  prenom: '',
  role: 'super',
  telephone_fixe: null,
  telephone_mobile: null,
}

test("envoie un email sur un octroi d'AEX", () => {
  const actual = emailsForAdministrationsGet(
    {
      typeId: 'mfr',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
    },
    'oct',
    titreIdValidator.parse('titreId'),
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
    },
    'oct',
    titreIdValidator.parse('titreId'),
    'arm',
    user,
    undefined
  )

  expect(actual).toMatchSnapshot()
})
