import { TypeEdit } from './type-edit'
import { Meta, Story } from '@storybook/vue3'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import {
  ETAPES_TYPES,
  etapesTypesIds
} from 'camino-common/src/static/etapesTypes'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Etape/TypeEdit',
  component: TypeEdit,
  argTypes: {}
}
export default meta

const onEtapeChange = action('onEtapeChange')

// TODO 2023-01-09: changer la notion de etapeIsDemandeEnConstruction qui devrait être géree par le composant type-edit directement
export const Simple: Story = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeIsDemandeEnConstruction={false}
    etapesTypesIds={etapesTypesIds}
    etape={{
      statutId: ETAPES_STATUTS.EN_CONSTRUCTION,
      type: { id: ETAPES_TYPES.demande }
    }}
  />
)

export const DemandeAvecUnSeulStatut: Story = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeIsDemandeEnConstruction={false}
    etapesTypesIds={etapesTypesIds}
    etape={{
      statutId: null,
      type: { id: ETAPES_TYPES.classementSansSuite }
    }}
  />
)

export const DemandeSansStatut: Story = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeIsDemandeEnConstruction={false}
    etapesTypesIds={etapesTypesIds}
    etape={{
      statutId: null,
      type: { id: ETAPES_TYPES.demande }
    }}
  />
)

export const DemandeEnConstruction: Story = () => (
  <TypeEdit
    onEtapeChange={onEtapeChange}
    etapeIsDemandeEnConstruction={true}
    etapesTypesIds={etapesTypesIds}
    etape={{
      statutId: ETAPES_STATUTS.EN_CONSTRUCTION,
      type: { id: ETAPES_TYPES.demande }
    }}
  />
)
