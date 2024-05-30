import { DeepReadonly, FunctionalComponent } from 'vue'
import { EtapeWithHeritage, HeritageProp } from 'camino-common/src/etape'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { ElementWithValue } from 'camino-common/src/sections'
import { HeritageEdit } from './heritage-edit'
import { SectionElement } from '../_common/new-section-element'
import { SectionElementEdit } from '../_common/new-sections-edit'
import { FlattenEtape } from 'camino-common/src/etape-form'

export type ElementHeritage = DeepReadonly<HeritageProp<Pick<EtapeWithHeritage, 'contenu' | 'typeId' | 'date'>>>
type Props = {
  sectionId: string
  elementWithValue: DeepReadonly<ElementWithValue>
  elementHeritage: DeepReadonly<FlattenEtape['contenu'][string][string]>
  updateElement: (etape: Props['elementHeritage']) => void
}

export const SectionElementWithValueEdit: FunctionalComponent<Props> = props => {
  const write = () => {
    return <SectionElementEdit element={props.elementWithValue} onValueChange={updateValue} />
  }

  const updateValue = (element: DeepReadonly<ElementWithValue>) => {
    props.updateElement({ ...props.elementHeritage, value: element.value })
  }
  const updateHeritage = (heritage: Props['elementHeritage']) => {
    props.updateElement(heritage)
  }

  const heritageValue = props.elementHeritage.value ?? null
  const hasHeritageValue: boolean = isNotNullNorUndefined(heritageValue) && Array.isArray(heritageValue) ? isNotNullNorUndefinedNorEmpty(heritageValue) : isNotNullNorUndefined(heritageValue)

  return (
    <HeritageEdit
      prop={props.elementHeritage}
      label={props.elementWithValue.nom ?? ''}
      hasHeritageValue={hasHeritageValue}
      read={etape => {
        if (isNotNullNorUndefined(etape)) {
          // @ts-ignore regarder si on peut narrow l'élément value
          return <SectionElement element={{ ...props.elementWithValue, value: etape.value }} />
        } else {
          return <></>
        }
      }}
      write={write}
      updateHeritage={updateHeritage}
    />
  )
}
