import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { hasValeurCheck } from '@/utils/contenu'
import { Tag } from '@/components/_ui/tag'
import { dateFormat } from '@/utils'
import { computed, HTMLAttributes } from 'vue'
import { HeritageProp } from 'camino-common/src/etape'
import { EtapeHeritageProps, EtapeHeritage } from './heritage-edit.types'

type Props<P extends EtapeHeritageProps, T extends EtapeHeritage> = {
  prop: HeritageProp<T>
  propId: P
  write?: () => JSX.Element
  read?: (heritagePropEtape: T | undefined) => JSX.Element
  display?: () => JSX.Element
}
const HeritageEditGeneric = <P extends EtapeHeritageProps, T extends EtapeHeritage>() =>
  caminoDefineComponent<Props<P, T>>(['prop', 'propId', 'write', 'display', 'read'], props => {
    const buttonText = computed<string>(() => (props.prop.actif ? 'Modifier' : `Hériter de l'étape précédente`))
    const incertain = computed<boolean>(() => (props.prop.etape?.incertitudes && props.prop.etape.incertitudes[props.propId]) ?? false)
    const hasHeritage = computed<boolean>(() => {
      return hasValeurCheck(props.propId, props.prop.etape)
    })

    return () => (
      <div class="mb-s">
        {!props.prop.actif && props.write ? (
          props.write()
        ) : (
          <div>
            {hasHeritage.value && props.read ? props.read(props.prop.etape) : <div class="border p-s mb-s">Non renseigné</div>}

            <div class="mb-s">{incertain.value ? <Tag mini={true} color="bg-info" text="Incertain" /> : null}</div>
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

export const HeritageEdit = <P extends EtapeHeritageProps, T extends EtapeHeritage>(props: Props<P, T> & HTMLAttributes): JSX.Element => {
  const HiddenHeritageEdit = HeritageEditGeneric<P, T>()
  // @ts-ignore
  return <HiddenHeritageEdit {...props} />
}
