import { Meta, StoryFn } from '@storybook/vue3'
import { DemarcheMiseEnConcurrence, Props } from './demarche-mise-en-concurrence'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { demarcheIdValidator } from 'camino-common/src/demarche'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'
import { toCaminoDate } from 'camino-common/src/date'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Titre/DemarcheMiseEnConcurrence',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: DemarcheMiseEnConcurrence,
}
export default meta

const idPivot = demarcheIdValidator.parse('idPivot')
const idSatellite = demarcheIdValidator.parse('idSatellite')

const getDemarcheMiseEnConcurrenceAction = action('getDemarcheMiseEnConcurrence')

const apiClient: Props['apiClient'] = {
  getDemarcheMiseEnConcurrence: demarcheId => {
    getDemarcheMiseEnConcurrenceAction(demarcheId)
    return Promise.resolve([
      {
        demarcheId: idSatellite,
        titreNom: 'Titre satellite',
      },
      {
        demarcheId: idPivot,
        titreNom: 'Titre Pivot',
      },
    ])
  },
}

const titrePivotAvantMEC: Props['titre'] = {
  titre_type_id: 'arm',
  demarches: [
    {
      id: idPivot,
      demarche_type_id: DEMARCHES_TYPES_IDS.Octroi,
      etapes: [
        {
          etape_type_id: ETAPES_TYPES.demande,
          date: toCaminoDate('4000-02-01'),
          demarche_id_en_concurrence: null,
        },
      ],
    },
  ],
}

const titrePivotPendantMEC: Props['titre'] = {
  titre_type_id: 'arm',
  demarches: [
    {
      id: idPivot,
      demarche_type_id: DEMARCHES_TYPES_IDS.Octroi,
      etapes: [
        {
          etape_type_id: ETAPES_TYPES.demande,
          date: toCaminoDate('4000-02-01'),
          demarche_id_en_concurrence: null,
        },
        {
          etape_type_id: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,

          date: toCaminoDate('4000-02-01'),
        },
      ],
    },
  ],
}

const titrePivotApresMEC: Props['titre'] = {
  titre_type_id: 'arm',
  demarches: [
    {
      id: idPivot,
      demarche_type_id: DEMARCHES_TYPES_IDS.Octroi,
      etapes: [
        {
          etape_type_id: ETAPES_TYPES.demande,
          date: toCaminoDate('4000-02-01'),
          demarche_id_en_concurrence: null,
        },
        { etape_type_id: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF, date: toCaminoDate('4000-02-01') },
        {
          etape_type_id: ETAPES_TYPES.resultatMiseEnConcurrence,
          date: toCaminoDate('4000-02-01'),
        },
      ],
    },
  ],
}

const titreSatellite: Props['titre'] = {
  titre_type_id: 'arm',
  demarches: [
    {
      id: idSatellite,
      demarche_type_id: DEMARCHES_TYPES_IDS.Octroi,
      etapes: [
        {
          etape_type_id: ETAPES_TYPES.demande,
          date: toCaminoDate('4000-02-01'),
          demarche_id_en_concurrence: idPivot,
        },
      ],
    },
  ],
}

const titreSatelliteApresMEC: Props['titre'] = {
  titre_type_id: 'arm',
  demarches: [
    {
      id: idSatellite,
      demarche_type_id: DEMARCHES_TYPES_IDS.Octroi,
      etapes: [
        {
          etape_type_id: ETAPES_TYPES.demande,
          date: toCaminoDate('4000-02-01'),
          demarche_id_en_concurrence: idPivot,
        },
        {
          etape_type_id: ETAPES_TYPES.resultatMiseEnConcurrence,
          date: toCaminoDate('4000-02-01'),
        },
      ],
    },
  ],
}

const titreExtensionDePerimetre: Props['titre'] = {
  titre_type_id: 'arm',
  demarches: [
    {
      id: idPivot,
      demarche_type_id: DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
      etapes: [
        {
          etape_type_id: ETAPES_TYPES.demande,
          date: toCaminoDate('4000-02-01'),
          demarche_id_en_concurrence: null,
        },
        {
          etape_type_id: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
          date: toCaminoDate('4000-02-01'),
        },
      ],
    },
  ],
}

const titrePivotNonProcedureSpecifique: Props['titre'] = {
  titre_type_id: 'arm',
  demarches: [
    {
      id: idPivot,
      demarche_type_id: DEMARCHES_TYPES_IDS.Octroi,
      etapes: [
        {
          etape_type_id: ETAPES_TYPES.demande,
          date: toCaminoDate('2020-02-01'),
          demarche_id_en_concurrence: null,
        },
      ],
    },
  ],
}

const apiClientLoading: Props['apiClient'] = {
  getDemarcheMiseEnConcurrence: async () => new Promise(() => {}),
}

const apiClientWithoutMiseEnConcurrence: Props['apiClient'] = {
  getDemarcheMiseEnConcurrence: () => Promise.resolve([]),
}

export const PivotAvantMECSansConcurrenceDeFait: StoryFn = () => (
  <DemarcheMiseEnConcurrence apiClient={apiClientWithoutMiseEnConcurrence} titre={titrePivotAvantMEC} user={{ role: 'admin' }} hasTitresFrom={false} />
)
export const PivotAvantMECAvecConcurrenceDeFait: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClient} titre={titrePivotAvantMEC} user={{ role: 'admin' }} hasTitresFrom={false} />
export const PivotAvantMECAvecConcurrenceDeFaitUserEntreprise: StoryFn = () => (
  <DemarcheMiseEnConcurrence apiClient={apiClient} titre={titrePivotAvantMEC} user={{ role: 'entreprise' }} hasTitresFrom={false} />
)
export const PivotAvantMECLoading: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClientLoading} titre={titrePivotAvantMEC} user={{ role: 'admin' }} hasTitresFrom={false} />

export const PivotPendantMECSansSatellites: StoryFn = () => (
  <DemarcheMiseEnConcurrence apiClient={apiClientWithoutMiseEnConcurrence} titre={titrePivotPendantMEC} user={{ role: 'entreprise' }} hasTitresFrom={false} />
)
export const PivotPendantMECAvecSatellites: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClient} titre={titrePivotPendantMEC} user={{ role: 'entreprise' }} hasTitresFrom={false} />
export const PivotPendantMECLoading: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClientLoading} titre={titrePivotPendantMEC} user={{ role: 'entreprise' }} hasTitresFrom={false} />

export const PivotApresMEC: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClient} titre={titrePivotApresMEC} user={{ role: 'entreprise' }} hasTitresFrom={false} />

export const SatelliteAvantMEC: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClient} titre={titreSatellite} user={{ role: 'admin' }} hasTitresFrom={false} />
export const SatelliteApresMEC: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClient} titre={titreSatelliteApresMEC} user={{ role: 'admin' }} hasTitresFrom={false} />

export const OctroiAvecTitresFrom: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClient} titre={titrePivotPendantMEC} user={{ role: 'entreprise' }} hasTitresFrom={true} />
export const OctroiSansTitresFrom: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClient} titre={titrePivotPendantMEC} user={{ role: 'entreprise' }} hasTitresFrom={false} />
export const OctroiTitresFromLoading: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClient} titre={titrePivotPendantMEC} user={{ role: 'entreprise' }} hasTitresFrom={'LOADING'} />
export const ExtensionDePerimetre: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClient} titre={titreExtensionDePerimetre} user={{ role: 'entreprise' }} hasTitresFrom={false} />

export const PivotNonProcedureSpecifique: StoryFn = () => <DemarcheMiseEnConcurrence apiClient={apiClient} titre={titrePivotNonProcedureSpecifique} user={{ role: 'admin' }} hasTitresFrom={false} />
