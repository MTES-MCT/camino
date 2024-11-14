import { Meta, StoryFn } from '@storybook/vue3'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { DemarchesConsentement, Props } from './demarche-consentement'

const meta: Meta = {
  title: 'Components/Titre/DemarcheConsentement',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: DemarchesConsentement,
}
export default meta

const demarcheIdConcurrent = demarcheIdValidator.parse('demarcheIdConcurrent')
const demarcheIdConcurrent2 = demarcheIdValidator.parse('demarcheIdConcurrent2')

const titre: Props['titre'] = {
  demarches: [
    {
      slug: demarcheSlugValidator.parse('demarcheSlug'),
      etapes: [
        {
          etape_type_id: ETAPES_TYPES.demande,
          demarches_consentement: [],
        },
      ],
    },
  ],
}

export const DemandeSansConsentement: StoryFn = () => <DemarchesConsentement demarcheSlug={demarcheSlugValidator.parse('demarcheSlug')} titre={titre} />

const titreAvecConsentement: Props['titre'] = {
  demarches: [
    {
      slug: demarcheSlugValidator.parse('demarcheSlug'),
      etapes: [
        {
          etape_type_id: ETAPES_TYPES.demande,
          demarches_consentement: [
            { demarcheId: demarcheIdConcurrent, titreNom: 'Titre 1' },
            { demarcheId: demarcheIdConcurrent2, titreNom: 'Titre 2' },
          ],
        },
      ],
    },
  ],
}

export const DemandeAvecConsentement: StoryFn = () => <DemarchesConsentement demarcheSlug={demarcheSlugValidator.parse('demarcheSlug')} titre={titreAvecConsentement} />

const titreAvecConsentementDejaFaite: Props['titre'] = {
  demarches: [
    {
      slug: demarcheSlugValidator.parse('demarcheSlug'),
      etapes: [
        {
          etape_type_id: ETAPES_TYPES.demandeDeConsentement,
        },
        {
          etape_type_id: ETAPES_TYPES.demande,
          demarches_consentement: [{ demarcheId: demarcheIdConcurrent, titreNom: 'Titre' }],
        },
      ],
    },
  ],
}

export const DemandeAvecConsentementDejaFaite: StoryFn = () => <DemarchesConsentement demarcheSlug={demarcheSlugValidator.parse('demarcheSlug')} titre={titreAvecConsentementDejaFaite} />
