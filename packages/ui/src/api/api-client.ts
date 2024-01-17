import { AdministrationApiClient, administrationApiClient } from '@/components/administration/administration-api-client'
import { TitresLinkFormApiClient, titresLinkFormApiClient } from '@/components/titre/titres-link-form-api-client'
import { TitreApiClient, titreApiClient } from '../components/titre/titre-api-client'
import { UtilisateurApiClient, utilisateurApiClient } from '@/components/utilisateur/utilisateur-api-client'
import { DemarcheApiClient, demarcheApiClient } from '@/components/titre/demarche-api-client'
import { EntrepriseApiClient, entrepriseApiClient } from '@/components/entreprise/entreprise-api-client'
import { EtapeApiClient, etapeApiClient } from '@/components/etape/etape-api-client'
import { DashboardApiClient, dashboardApiClient } from '@/components/dashboard/dashboard-api-client'
import { JournauxApiClient, journauxApiClient } from '@/components/journaux/journaux-api-client'
import { ActiviteApiClient, activiteApiClient } from '@/components/activite/activite-api-client'
import { TempDocumentName } from 'camino-common/src/document'
import { uploadCall } from './_upload'
import { PerimetreApiClient, perimetreApiClient } from '../components/titre/perimetre-api-client'

export interface ApiClient
  extends AdministrationApiClient,
    TitresLinkFormApiClient,
    TitreApiClient,
    UtilisateurApiClient,
    EtapeApiClient,
    DashboardApiClient,
    JournauxApiClient,
    ActiviteApiClient,
    EntrepriseApiClient,
    DemarcheApiClient,
    PerimetreApiClient{
  uploadTempDocument: (document: File) => Promise<TempDocumentName>
}

// TODO 2023-08-10 certains noms de fonction peuvent être overrider comme getEntreprises, il faudrait avoir un controle plus contraignant
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
  ...activiteApiClient,
  ...demarcheApiClient,
  ...perimetreApiClient,
  uploadTempDocument: async (document: File) => {
    const tempDocumentName = await uploadCall(document, _progress => {})
    return tempDocumentName
  },
}
