import { hasValeurCheck } from '@/utils/contenu'
import { dateFormat } from '@/utils'
import { DeepReadonly, HTMLAttributes, computed, defineComponent } from 'vue'
import {  FullEtapeHeritage, HeritageProp } from 'camino-common/src/etape'
import { EtapeHeritageProps, mappingHeritagePropsNameEtapePropsName } from 'camino-common/src/heritage'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DsfrToggle } from '../_ui/dsfr-toggle'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { capitalize } from 'camino-common/src/strings'

type EtapeHeritageEdit = Pick<FullEtapeHeritage, 'typeId' | 'date'>
type Props<P extends EtapeHeritageProps, T extends EtapeHeritageEdit> = {
  prop: DeepReadonly<HeritageProp<T>>
  propId: P
  write: () => JSX.Element
  read: (heritagePropEtape?: DeepReadonly<T>) => JSX.Element
  class?: HTMLAttributes['class']
  updateHeritage: (update: Props<P, T>['prop']) => void
}
export const HeritageEdit = defineComponent(<P extends EtapeHeritageProps, T extends EtapeHeritageEdit>(props: Props<P, T>) => {
  const hasHeritage = computed<boolean>(() => {
    return mappingHeritagePropsNameEtapePropsName[props.propId].some(field => hasValeurCheck(field, props.prop.etape))
  })

  const legendHint = computed<string | undefined>(() => {

    return props.prop.actif && isNotNullNorUndefined(props.prop.etape) ? `Hérité de : ${capitalize(EtapesTypes[props.prop.etape.typeId].nom)} (${dateFormat(props.prop.etape.date)})` : undefined
  })

  const updateHeritage = () => {
    const etape = props.prop.etape
    const newHeritage = !props.prop.actif
    if (!newHeritage) {
      props.updateHeritage({etape, actif: newHeritage})
    } else if (isNotNullNorUndefined(etape)) {
      props.updateHeritage({etape, actif: newHeritage})
    }
  }

  return () => (
    <div class={['mb-s', props.class]}>
      {!props.prop.actif ? props.write() : <div>{hasHeritage.value ? props.read(props.prop.etape) : <div class="border p-s mb-s">Non renseigné</div>}</div>}

      {isNotNullNorUndefined(props.prop.etape) ? (
        <div class="dsfr">
          <DsfrToggle
            initialValue={props.prop.actif}
            valueChanged={updateHeritage}
            legendLabel="Hériter de l’étape précédente"
            legendHint={legendHint.value}
          />
        </div>
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
HeritageEdit.props = ['prop', 'propId', 'write', 'read', 'display', 'class', 'updateHeritage']
