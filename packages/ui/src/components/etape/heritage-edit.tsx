import { dateFormat } from '@/utils'
import { DeepReadonly, HTMLAttributes, computed, defineComponent } from 'vue'
import { EtapeWithHeritage, HeritageProp } from 'camino-common/src/etape'
import { MappingHeritagePropsNameEtapePropsName, mappingHeritagePropsNameEtapePropsName } from 'camino-common/src/heritage'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DsfrToggle } from '../_ui/dsfr-toggle'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { capitalize } from 'camino-common/src/strings'

type EtapeHeritageEdit = Pick<EtapeWithHeritage, 'typeId' | 'date'>
type Props<P extends keyof MappingHeritagePropsNameEtapePropsName, T extends EtapeHeritageEdit> = {
  prop: DeepReadonly<HeritageProp<T>>
  propId: P
  hasHeritage: boolean
  write: () => JSX.Element
  read: (heritagePropEtape?: DeepReadonly<T>) => JSX.Element

  class?: HTMLAttributes['class']
  updateHeritage: (update: Props<P, T>['prop']) => void
}

export const HeritageEdit = defineComponent(<P extends keyof MappingHeritagePropsNameEtapePropsName, T extends EtapeHeritageEdit>(props: Props<P, T>) => {

  const updateHeritage = () => {
    const etape = props.prop.etape
    const newHeritage = !props.prop.actif
    if (!newHeritage) {
      props.updateHeritage({ etape, actif: newHeritage })
    } else if (isNotNullNorUndefined(etape)) {
      props.updateHeritage({ etape, actif: newHeritage })
    }
  }

  return () => (
    <div class={['mb-s', props.class]}>
      {!props.prop.actif ? props.write() : <div>{props.hasHeritage && isNotNullNorUndefined(props.prop.etape) ? props.read(props.prop.etape) : <div class="border p-s mb-s">Non renseigné</div>}</div>}

      {isNotNullNorUndefined(props.prop.etape) ? (
        <div class="dsfr">
          <DsfrToggle initialValue={props.prop.actif} valueChanged={updateHeritage} legendLabel={`Hériter de l’étape "${capitalize(EtapesTypes[props.prop.etape.typeId].nom)}" du ${dateFormat(props.prop.etape.date)}`} />
        </div>
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
HeritageEdit.props = ['prop', 'propId', 'write', 'read', 'display', 'class', 'updateHeritage', 'hasHeritage']
