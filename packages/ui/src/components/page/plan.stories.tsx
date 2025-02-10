import { Meta, StoryFn } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { PurePlanDuSite } from './plan'

const meta: Meta = {
  title: 'Pages/Plan',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: PurePlanDuSite,
}
export default meta

export const Super: StoryFn = () => <PurePlanDuSite user={{ ...testBlankUser, role: 'super' }} />
export const AdminONF: StoryFn = () => <PurePlanDuSite user={{ ...testBlankUser, role: 'admin', administrationId: 'ope-onf-973-01' }} />
export const AdminDGTM: StoryFn = () => <PurePlanDuSite user={{ ...testBlankUser, role: 'admin', administrationId: 'dea-guyane-01' }} />
export const Editeur: StoryFn = () => <PurePlanDuSite user={{ ...testBlankUser, role: 'editeur', administrationId: 'ope-onf-973-01' }} />
export const Lecteur: StoryFn = () => <PurePlanDuSite user={{ ...testBlankUser, role: 'lecteur', administrationId: 'ope-onf-973-01' }} />
export const Entreprise: StoryFn = () => <PurePlanDuSite user={{ ...testBlankUser, role: 'entreprise', entrepriseIds: [] }} />
export const BureauDEtudes: StoryFn = () => <PurePlanDuSite user={{ ...testBlankUser, role: "bureau d'études", entrepriseIds: [] }} />
export const Defaut: StoryFn = () => <PurePlanDuSite user={{ ...testBlankUser, role: 'defaut' }} />
export const Deconnecte: StoryFn = () => <PurePlanDuSite user={undefined} />
