import { AdministrationApiClient, administrationApiClient } from '@/components/administration/administration-api-client'
import { TitresLinkFormApiClient, titresLinkFormApiClient } from '@/components/titre/titres-link-form-api-client'
import { TitreApiClient, titreApiClient } from '../components/titre/titre-api-client'
import { UtilisateurApiClient, utilisateurApiClient } from '@/components/utilisateur/utilisateur-api-client'
import { demarcheApiClient } from '@/components/titre/demarche-api-client'
import { entrepriseApiClient } from '@/components/entreprise/entreprise-api-client'
import { EtapeApiClient, etapeApiClient } from '@/components/etape/etape-api-client'
import { DashboardApiClient, dashboardApiClient } from '@/components/dashboard/dashboard-api-client'
import { JournauxApiClient, journauxApiClient } from '@/components/journaux/journaux-api-client'

export interface ApiClient extends AdministrationApiClient, TitresLinkFormApiClient, TitreApiClient, UtilisateurApiClient, EtapeApiClient, DashboardApiClient, JournauxApiClient {}

export const apiClient: ApiClient = {
  ...administrationApiClient,
  ...titresLinkFormApiClient,
  ...titreApiClient,
  ...demarcheApiClient,
  ...entrepriseApiClient,
  ...etapeApiClient,
  ...utilisateurApiClient,
  ...dashboardApiClient,
  ...journauxApiClient,
}
