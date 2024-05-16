import { dateFormat } from 'camino-common/src/date'
import { DeepReadonly, HTMLAttributes } from 'vue'
import { EtapeWithHeritage, HeritageProp } from 'camino-common/src/etape'
import { MappingHeritagePropsNameEtapePropsName } from 'camino-common/src/heritage'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DsfrToggle } from '../_ui/dsfr-toggle'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { capitalize } from 'camino-common/src/strings'
import type { JSX } from 'vue/jsx-runtime'
import { DsfrInput } from '@/components/_ui/dsfr-input'
import { random } from '../../utils/vue-tsx-utils'

type EtapeHeritageEdit = Pick<EtapeWithHeritage, 'typeId' | 'date'>
type Props<P extends keyof MappingHeritagePropsNameEtapePropsName, T extends EtapeHeritageEdit> = {
  prop: DeepReadonly<HeritageProp<T>>
  propId: P
  hasHeritage: boolean
  write: () => JSX.Element
  read: (heritagePropEtape?: DeepReadonly<T>) => JSX.Element
  label: string | null

  class?: HTMLAttributes['class']
  updateHeritage: (update: Props<P, T>['prop']) => void
}

export const HeritageEdit = <P extends keyof MappingHeritagePropsNameEtapePropsName, T extends EtapeHeritageEdit>(props: Props<P, T>) => {
  const updateHeritage = () => {
    const etape = props.prop.etape
    const newHeritage = !props.prop.actif
    if (!newHeritage) {
      props.updateHeritage({ etape, actif: newHeritage })
    } else if (isNotNullNorUndefined(etape)) {
      props.updateHeritage({ etape, actif: newHeritage })
    }
  }

  const dummyValueChanged = () => {}
  // TODO 2024-05-14 WTF! Sans la clé il récupère un ancien input et le modifie que à moitié. Le bug est présent sur le champ « Durée » quand on a passe d’une valeur saisie à un héritage Non Renseigné
  const dummyKey = `empty_input_${(random() * 1000).toFixed()}`

  return (
    <div class={['fr-mb-1w', props.class]}>
      {!props.prop.actif ? (
        props.write()
      ) : (
        <div>
          {props.hasHeritage && isNotNullNorUndefined(props.prop.etape) ? (
            props.read(props.prop.etape)
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

      {isNotNullNorUndefined(props.prop.etape) ? (
        <div>
          <DsfrToggle
            initialValue={props.prop.actif}
            valueChanged={updateHeritage}
            legendLabel={`Hériter de l’étape "${capitalize(EtapesTypes[props.prop.etape.typeId].nom)}" du ${dateFormat(props.prop.etape.date)}`}
          />
        </div>
      ) : null}
    </div>
  )
}
