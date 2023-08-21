import { Header } from './header'
import { Meta, StoryFn } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/Page/Header',
  component: Header,
  decorators: [
    vueRouter([
      { name: 'administration' },
      { name: 'utilisateurs' },
      { name: 'titres' },
      { name: 'homepage' },
      { name: 'dashboard' },
      { name: 'activites' },
      { name: 'travaux' },
      { name: 'demarches' },
      { name: 'administrations' },
      { name: 'entreprises' },
      { name: 'metas' },
      { name: 'journaux' },
    ]),
  ],
}
export default meta

export const Super: StoryFn = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'super' }} />
export const Admin: StoryFn = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'admin', administrationId: 'ope-onf-973-01' }} />
export const Editeur: StoryFn = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'editeur', administrationId: 'ope-onf-973-01' }} />
export const Lecteur: StoryFn = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'lecteur', administrationId: 'ope-onf-973-01' }} />
export const Entreprise: StoryFn = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'entreprise', entreprises: [] }} />
export const BureauDEtudes: StoryFn = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'bureau d’études', entreprises: [] }} />
export const Defaut: StoryFn = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'defaut' }} />
export const Deconnecte: StoryFn = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={undefined} />
