import { DeepReadonly, FunctionalComponent } from 'vue'
import { EtapeWithHeritage, HeritageProp } from 'camino-common/src/etape'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { ElementWithValue } from 'camino-common/src/sections'
import { HeritageEdit } from './heritage-edit'
import { SectionElement } from '../_common/new-section-element'
import { SectionElementEdit } from '../_common/new-sections-edit'

export type ElementHeritage = DeepReadonly<HeritageProp<Pick<EtapeWithHeritage, 'contenu' | 'typeId' | 'date'>>>
type Props = {
  sectionId: string
  elementWithValue: DeepReadonly<ElementWithValue>
  elementHeritage: ElementHeritage
  updateElement: (element: Props['elementWithValue']) => void
  updateHeritage: (etape: Props['elementHeritage']) => void
}
export const SectionElementWithValueEdit: FunctionalComponent<Props> = props => {
  const read = (etape?: DeepReadonly<Pick<EtapeWithHeritage, 'contenu' | 'typeId' | 'date'>>) => {
    if (isNotNullNorUndefined(etape)) {
      // @ts-ignore regarder si on peut narrow l'élément value
      return <SectionElement element={{ ...props.elementWithValue, value: etape.contenu[props.sectionId]?.[props.elementWithValue.id] }} />
    } else {
      return <></>
    }
  }

  const write = () => {
    return <SectionElementEdit element={props.elementWithValue} onValueChange={props.updateElement} />
  }

  const heritageValue = props.elementHeritage.etape?.contenu?.[props.sectionId]?.[props.elementWithValue.id]
  const hasHeritageValue: boolean = (isNotNullNorUndefined(heritageValue) && (!Array.isArray(heritageValue) || heritageValue.length > 0))

  return <HeritageEdit prop={props.elementHeritage} hasHeritage={hasHeritageValue} propId="contenu" read={read} write={write} updateHeritage={props.updateHeritage} />
}
