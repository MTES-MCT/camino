import { FunctionalComponent } from 'vue'
import { Journaux as JournauxComp } from './journaux/journaux'
import { apiClient } from '@/api/api-client'

// TODO 2023-12-21: merge with journaux/Journaux.tsx
export const Journaux: FunctionalComponent = () => <JournauxComp apiClient={apiClient} />

// Demandé par le router car utilisé dans un import asynchrone /shrug
Journaux.displayName = 'Journaux'
