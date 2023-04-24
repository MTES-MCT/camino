import { AdministrationApiClient, administrationApiClient } from '@/components/administration/administration-api-client'
import { Entreprise } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { TitresLinkFormApiClient, titresLinkFormApiClient } from '@/components/titre/titres-link-form-api-client'
import { TitreApiClient, titreApiClient } from '../components/titre/titre-api-client'
import { UtilisateurApiClient, utilisateurApiClient } from '@/components/utilisateur/utilisateur-api-client'
import { demarcheApiClient } from '@/components/titre/demarche-api-client'
import { entrepriseApiClient } from '@/components/entreprise/entreprise-api-client'
import { EtapeApiClient, etapeApiClient } from '@/components/etape/etape-api-client'

export type Utilisateur = {
  id: string
  prenom: string
  nom: string
  email: string
  telephoneFixe?: string
  telephoneMobile?: string
  entreprises?: Entreprise[]
} & User

export interface ApiClient extends AdministrationApiClient, TitresLinkFormApiClient, TitreApiClient, UtilisateurApiClient, EtapeApiClient {}

export const apiClient: ApiClient = {
  ...administrationApiClient,
  ...titresLinkFormApiClient,
  ...titreApiClient,
  ...demarcheApiClient,
  ...entrepriseApiClient,
  ...etapeApiClient,
  ...utilisateurApiClient,
}
