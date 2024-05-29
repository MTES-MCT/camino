import { dateFormat } from 'camino-common/src/date'
import { HTMLAttributes } from 'vue'
import { DeepReadonly, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DsfrToggle } from '../_ui/dsfr-toggle'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { capitalize } from 'camino-common/src/strings'
import type { JSX } from 'vue/jsx-runtime'
import { DsfrInput } from '@/components/_ui/dsfr-input'
import { random } from '../../utils/vue-tsx-utils'
import { FlattenEtape } from 'camino-common/src/etape-form'
import { ElementWithValueAndHeritage } from 'camino-common/src/sections'

type HeritagePossible =
  | FlattenEtape['perimetre']
  | FlattenEtape['dateDebut']
  | FlattenEtape['dateFin']
  | FlattenEtape['titulaires']
  | FlattenEtape['amodiataires']
  | FlattenEtape['duree']
  | FlattenEtape['substances']
  | ElementWithValueAndHeritage['value']
type Props<T extends DeepReadonly<HeritagePossible>> = {
  prop: T
  write: () => JSX.Element
  read: (heritagePropEtape?: NoInfer<T>['etapeHeritee']) => JSX.Element
  label: string | null
  hasHeritageValue: boolean
  class?: HTMLAttributes['class']
  updateHeritage: (update: NoInfer<T>) => void
}

export const HeritageEdit = <T extends DeepReadonly<HeritagePossible>>(props: Props<T>) => {
  const updateHeritage = () => {
    const etape = props.prop.etapeHeritee
    const newHeritage = !props.prop.heritee
    if (!newHeritage) {
      props.updateHeritage({ ...props.prop, heritee: newHeritage })
    } else if (isNotNullNorUndefined(etape)) {
      props.updateHeritage({ ...props.prop, value: etape?.value ?? null, heritee: newHeritage })
    }
  }

  const dummyValueChanged = () => {}
  // TODO 2024-05-14 WTF! Sans la clé il récupère un ancien input et le modifie que à moitié. Le bug est présent sur le champ « Durée » quand on a passe d’une valeur saisie à un héritage Non Renseigné
  const dummyKey = `empty_input_${(random() * 1000).toFixed()}`

  const etapeHeritee = props.prop.etapeHeritee ?? null
  return (
    <div class={['fr-mb-1w', props.class]}>
      {JSON.stringify(etapeHeritee)}
      {!props.prop.heritee ? (
        props.write()
      ) : (
        <div>
          {props.hasHeritageValue ? (
            props.read(etapeHeritee)
          ) : (
            <DsfrInput
              key={dummyKey}
              type={{ type: 'text' }}
              disabled={true}
              initialValue={'Non renseigné'}
              legend={{ main: props.label ?? '', visible: props.label !== null }}
              valueChanged={dummyValueChanged}
            />
          )}
        </div>
      )}

      {isNotNullNorUndefined(etapeHeritee) ? (
        <div>
          <DsfrToggle
            initialValue={props.prop.heritee}
            valueChanged={updateHeritage}
            legendLabel={`Hériter de l’étape "${capitalize(EtapesTypes[etapeHeritee.etapeTypeId].nom)}" du ${dateFormat(etapeHeritee.date)}`}
          />
        </div>
      ) : null}
    </div>
  )
}
