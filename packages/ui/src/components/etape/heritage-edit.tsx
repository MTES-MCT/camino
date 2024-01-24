import { hasValeurCheck } from '@/utils/contenu'
import { dateFormat } from '@/utils'
import { HTMLAttributes, computed, defineComponent } from 'vue'
import { HeritageProp } from 'camino-common/src/etape'
import { EtapeHeritage } from './heritage-edit.types'
import { EtapeHeritageProps } from 'camino-common/src/heritage'

type Props<P extends EtapeHeritageProps, T extends EtapeHeritage> = {
  prop: HeritageProp<T>
  propId: P
  write?: () => JSX.Element
  read?: (heritagePropEtape: T | undefined) => JSX.Element
  display?: () => JSX.Element
  class?: HTMLAttributes['class']
}
export const HeritageEdit = defineComponent(<P extends EtapeHeritageProps, T extends EtapeHeritage>(props: Props<P, T>) => {
  const buttonText = computed<string>(() => (props.prop.actif ? 'Modifier' : `Hériter de l'étape précédente`))
  const hasHeritage = computed<boolean>(() => {
    return hasValeurCheck(props.propId, props.prop.etape)
  })

  return () => (
    <div class={['mb-s', props.class]}>
      {!props.prop.actif && props.write ? (
        props.write()
      ) : (
        <div>
          {hasHeritage.value && props.read ? props.read(props.prop.etape) : <div class="border p-s mb-s">Non renseigné</div>}

          <p class="h6 italic mb-s">
            Hérité de :<span class="cap-first">{props.prop.etape?.type.nom}</span> ({dateFormat(props.prop.etape?.date)})
          </p>
        </div>
      )}

      {props.display ? props.display() : null}
      {props.prop.etape ? (
        <button class="btn full-x rnd-xs py-s px-m small mb-s" onClick={() => (props.prop.actif = !props.prop.actif)}>
          {buttonText.value}
        </button>
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
HeritageEdit.props = ['prop', 'propId', 'write', 'read', 'display', 'class']
