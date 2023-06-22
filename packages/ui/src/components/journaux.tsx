import { FunctionalComponent } from 'vue'
import { Journaux as JournauxComp } from './journaux/journaux'
import { journauxApiClient } from './journaux/journaux-api-client'

export const Journaux: FunctionalComponent = () => <JournauxComp apiClient={journauxApiClient} titreId={null} />

// Demandé par le router car utilisé dans un import asynchrone /shrug
Journaux.displayName = 'Journaux'
