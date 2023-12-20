import { FunctionalComponent } from 'vue'
import { Journaux as JournauxComp } from './journaux/journaux'
import { apiClient } from '@/api/api-client'

export const Journaux: FunctionalComponent = () => <JournauxComp apiClient={apiClient} titreId={null} />

// Demandé par le router car utilisé dans un import asynchrone /shrug
Journaux.displayName = 'Journaux'
