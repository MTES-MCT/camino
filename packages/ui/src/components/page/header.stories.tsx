import { Header } from './header'
import { Meta, StoryFn, StoryObj } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { expect, userEvent, within } from '@storybook/test'

const meta = {
  title: 'Components/Page/Header',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: Header,
} satisfies Meta<typeof Header>
export default meta
type Story = StoryObj<typeof meta>

// Function to emulate pausing between interactions
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const CanOpenAnnuaire: Story = {
  args: {
    currentMenuSection: 'utilisateurs',
    routePath: "/titres?domainesIds=['m']",
    user: { ...testBlankUser, role: 'super' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('Annuaire'))
    await canvas.findByText('Utilisateurs')
    const collapseDiv = canvasElement.getElementsByClassName('fr-collapse')
    await expect(collapseDiv).toHaveLength(1)
    await sleep(300)
    await expect(collapseDiv[0].getBoundingClientRect().height).toBeGreaterThan(30)
  },
}

export const Super: StoryFn = () => <Header currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'super' }} routePath="/titres?domainesIds=['m']" />
export const AdminONF: StoryFn = () => (
  <Header currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'admin', administrationId: 'ope-onf-973-01' }} routePath="/titres?domainesIds=['m']" />
)
export const AdminDGTM: StoryFn = () => (
  <Header currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'admin', administrationId: 'dea-guyane-01' }} routePath="/titres?domainesIds=['m']" />
)
export const Editeur: StoryFn = () => (
  <Header currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'editeur', administrationId: 'ope-onf-973-01' }} routePath="/titres?domainesIds=['m']" />
)
export const Lecteur: StoryFn = () => (
  <Header currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'lecteur', administrationId: 'ope-onf-973-01' }} routePath="/titres?domainesIds=['m']" />
)
export const Entreprise: StoryFn = () => <Header currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'entreprise', entreprises: [] }} routePath="/titres?domainesIds=['m']" />
export const BureauDEtudes: StoryFn = () => <Header currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'bureau d’études', entreprises: [] }} routePath="/titres?domainesIds=['m']" />
export const Defaut: StoryFn = () => <Header currentMenuSection={'utilisateurs'} user={{ ...testBlankUser, role: 'defaut' }} routePath="/titres?domainesIds=['m']" />
export const Deconnecte: StoryFn = () => <Header currentMenuSection={'utilisateurs'} user={undefined} routePath="/titres?domainesIds=['m']" />
