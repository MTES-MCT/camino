import { AdministrationApiClient, administrationApiClient } from '@/components/administration/administration-api-client'
import { Entreprise } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { PureTitresLinkFormApiClient, pureTitresLinkFormApiClient } from '@/components/titre/pure-titres-link-form-api-client'
import { TitreApiClient, titreApiClient } from '../components/titre/titre-api-client'
import { UtilisateurApiClient, utilisateurApiClient } from '@/components/utilisateur/utilisateur-api-client'

export type Utilisateur = {
  id: string
  prenom: string
  nom: string
  email: string
  telephoneFixe?: string
  telephoneMobile?: string
  entreprises?: Entreprise[]
} & User

export interface ApiClient extends AdministrationApiClient, PureTitresLinkFormApiClient, TitreApiClient, UtilisateurApiClient {}

export const apiClient: ApiClient = {
  ...administrationApiClient,
  ...pureTitresLinkFormApiClient,
  ...titreApiClient,
  ...utilisateurApiClient,
}
