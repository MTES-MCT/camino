import {
  AdministrationApiClient,
  administrationApiClient
} from '@/components/administration/administration-api-client'
import { Entreprise } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'

export type Utilisateur = {
  id: string
  prenom: string
  nom: string
  email: string
  entreprises?: Entreprise[]
} & User

export interface ApiClient extends AdministrationApiClient {}

export const apiClient: ApiClient = {
  ...administrationApiClient
}
