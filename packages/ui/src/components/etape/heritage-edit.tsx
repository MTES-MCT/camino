import { dateFormat } from 'camino-common/src/date'
import { HTMLAttributes } from 'vue'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DsfrToggle } from '../_ui/dsfr-toggle'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { capitalize } from 'camino-common/src/strings'
import type { JSX } from 'vue/jsx-runtime'
import { DsfrInput } from '@/components/_ui/dsfr-input'
import { random } from '../../utils/vue-tsx-utils'
import { GenericHeritageValue } from './etape-api-client'
import { z } from 'zod'

type Props<T extends z.ZodTypeAny> = {
  prop: GenericHeritageValue<T>
  write: () => JSX.Element
  read: (heritagePropEtape?: GenericHeritageValue<NoInfer<T>>['etapeHeritee']) => JSX.Element
  label: string | null

  class?: HTMLAttributes['class']
  updateHeritage: (update: GenericHeritageValue<T>) => void
}

export const HeritageEdit = <T extends z.ZodTypeAny>(props: Props<T>) => {
  const updateHeritage = () => {
    const etape = props.prop.etapeHeritee
    const newHeritage = !props.prop.heritee
    if (!newHeritage) {
      props.updateHeritage({ ...props.prop, heritee: newHeritage })
    } else if (isNotNullNorUndefined(etape)) {
      props.updateHeritage({ ...props.prop, heritee: newHeritage, value: etape?.value ?? null })
    }
  }


  const dummyValueChanged = () => {}
  // TODO 2024-05-14 WTF! Sans la clé il récupère un ancien input et le modifie que à moitié. Le bug est présent sur le champ « Durée » quand on a passe d’une valeur saisie à un héritage Non Renseigné
  const dummyKey = `empty_input_${(random() * 1000).toFixed()}`

  const etapeHeritee = props.prop.etapeHeritee ?? null

  return (
    <div class={['fr-mb-1w', props.class]}>
      {!props.prop.heritee ? (
        props.write()
      ) : (
        <div>
          { isNotNullNorUndefined(etapeHeritee?.value) ? (
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
