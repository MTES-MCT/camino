import Cerbere from 'cerbere'
import { IUtilisateurCreation } from '../../types.js'

const config = {
  cerbereUrl:
    'https://authentification.din.developpement-durable.gouv.fr/cas/public',
  serviceUrl: 'camino.beta.gouv.fr'
}

const cerbereClient = new Cerbere({ url: config.cerbereUrl })

interface ICerbereProfile {
  id?: string
  prenom?: string
  nom?: string
  email?: string
  telephoneFixe?: string
  unite?: string
  entrepriseLegalSiren?: string
}

const cerbereProfileProperties = {
  id: 'UTILISATEUR.ID',
  prenom: 'UTILISATEUR.PRENOM',
  nom: 'UTILISATEUR.NOM',
  email: 'UTILISATEUR.MEL',
  telephoneFixe: 'UTILISATEUR.TEL_FIXE',
  unite: 'UTILISATEUR.UNITE',
  entrepriseLegalSiren: 'ENTREPRISE.SIREN'
} as ICerbereProfile

const cerbereProfileFormat = (attributes: { [key: string]: string }) =>
  (Object.keys(cerbereProfileProperties) as (keyof ICerbereProfile)[]).reduce(
    (cerbereProfile: ICerbereProfile, id) => {
      const key = cerbereProfileProperties[id]!
      const value = attributes[key]

      if (value) {
        cerbereProfile[id] = value
      }

      return cerbereProfile
    },
    {}
  )

export const login = async (ticket: string) => {
  try {
    const { attributes } = await cerbereClient.validate(ticket)

    const cerbereProfile = cerbereProfileFormat(attributes)

    const cerbereUtilisateur: IUtilisateurCreation = {
      email: cerbereProfile.email,
      prenom: cerbereProfile.prenom,
      nom: cerbereProfile.nom,
      telephoneFixe: cerbereProfile.telephoneFixe,
      dateCreation: '2022-05-12',
      role: 'defaut',
      administrationId: undefined
    }

    return cerbereUtilisateur
  } catch (err: any) {
    err.message = `Cerbère: echec de l'authentification ${err.message}`

    throw err
  }
}

export const logout = (returnUrl: string) =>
  cerbereClient.logout(returnUrl, true)
