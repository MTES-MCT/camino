import { Header } from './header'
import { Meta, Story } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Page/Header',
  component: Header,
}
export default meta

export const Super: Story = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'super' }} />
export const Admin: Story = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'admin', administrationId: 'ope-onf-973-01' }} />
export const Editeur: Story = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'editeur', administrationId: 'ope-onf-973-01' }} />
export const Lecteur: Story = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'lecteur', administrationId: 'ope-onf-973-01' }} />
export const Entreprise: Story = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'entreprise', entreprises: [] }} />
export const BureauDEtudes: Story = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'bureau d’études', entreprises: [] }} />
export const Defaut: Story = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'defaut' }} />
export const Deconnecte: Story = () => <Header trackEvent={() => ({})} currentMenuSection={'utilisateurs'} user={undefined} />
