import { hasValeurCheck } from '@/utils/contenu'
import { dateFormat } from '@/utils'
import { HTMLAttributes, computed, defineComponent } from 'vue'
import { HeritageProp } from 'camino-common/src/etape'
import { EtapeHeritage } from './heritage-edit.types'
import { EtapeHeritageProps, mappingHeritagePropsNameEtapePropsName } from 'camino-common/src/heritage'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DsfrToggle } from '../_ui/dsfr-toggle'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'

type Props<P extends EtapeHeritageProps, T extends EtapeHeritage> = {
  prop: HeritageProp<T>
  propId: P
  write: () => JSX.Element
  read: (heritagePropEtape: T | undefined) => JSX.Element
  class?: HTMLAttributes['class']
}
export const HeritageEdit = defineComponent(<P extends EtapeHeritageProps, T extends EtapeHeritage>(props: Props<P, T>) => {
  const hasHeritage = computed<boolean>(() => {
    return mappingHeritagePropsNameEtapePropsName[props.propId].some(field => hasValeurCheck(field, props.prop.etape))
  })

  const legendHint = computed<string | undefined>(() => {
    return props.prop.actif ? `Hérité de : ${EtapesTypes[props.prop.etape.typeId].nom} (${dateFormat(props.prop.etape?.date)})` : undefined
  })

  return () => (
    <div class={['mb-s', props.class]}>
      {!props.prop.actif ? props.write() : <div>{hasHeritage.value ? props.read(props.prop.etape) : <div class="border p-s mb-s">Non renseigné</div>}</div>}

      {isNotNullNorUndefined(props.prop.etape) ? (
        <div class="dsfr">
          <DsfrToggle
            initialValue={props.prop.actif}
            valueChanged={() => {
              props.prop.actif = !props.prop.actif
            }}
            legendLabel="Hériter de l’étape précédente"
            legendHint={legendHint.value}
          />
        </div>
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
HeritageEdit.props = ['prop', 'propId', 'write', 'read', 'display', 'class']
