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

export const Super: StoryFn = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'super' }} routePath="/titres?domainesIds=['m']" />
export const AdminONF: StoryFn = () => (
  <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'admin', administrationId: 'ope-onf-973-01' }} routePath="/titres?domainesIds=['m']" />
)
export const AdminDGTM: StoryFn = () => (
  <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'admin', administrationId: 'dea-guyane-01' }} routePath="/titres?domainesIds=['m']" />
)
export const Editeur: StoryFn = () => (
  <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'editeur', administrationId: 'ope-onf-973-01' }} routePath="/titres?domainesIds=['m']" />
)
export const Lecteur: StoryFn = () => (
  <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'lecteur', administrationId: 'ope-onf-973-01' }} routePath="/titres?domainesIds=['m']" />
)
export const Entreprise: StoryFn = () => (
  <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'entreprise', entreprises: [] }} routePath="/titres?domainesIds=['m']" />
)
export const BureauDEtudes: StoryFn = () => (
  <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'bureau d’études', entreprises: [] }} routePath="/titres?domainesIds=['m']" />
)
export const Defaut: StoryFn = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'defaut' }} routePath="/titres?domainesIds=['m']" />
export const Deconnecte: StoryFn = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={undefined} routePath="/titres?domainesIds=['m']" />
