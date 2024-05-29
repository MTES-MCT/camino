import { DeepReadonly, FunctionalComponent } from 'vue'
import { EtapeWithHeritage, HeritageProp } from 'camino-common/src/etape'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { ElementWithValue, ElementWithValueAndHeritage } from 'camino-common/src/sections'
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
  const valueWithHeritage: DeepReadonly<ElementWithValueAndHeritage> = {
    ...props.elementWithValue,
    // @ts-ignore ici, typescript ne peut pas voir que props.elementWithValue.value est du même type que props.elementHeritage.etape.contenu... il faut que l'on change notre modèle de donnée en amont
    value: {
      value: props.elementHeritage.actif ? props.elementHeritage.etape?.contenu[props.sectionId]?.[props.elementWithValue.id] ?? null : props.elementWithValue.value,
      heritee: props.elementHeritage.actif,
      etapeHeritee: isNotNullNorUndefined(props.elementHeritage.etape)
        ? { date: props.elementHeritage.etape.date, etapeTypeId: props.elementHeritage.etape.typeId, value: props.elementHeritage.etape.contenu[props.sectionId]?.[props.elementWithValue.id] }
        : null,
    },
  }

  const write = () => {
    return <SectionElementEdit element={props.elementWithValue} onValueChange={props.updateElement} />
  }

  const updateHeritage = (heritage: DeepReadonly<ElementWithValueAndHeritage['value']>) => {
    if (heritage.heritee) {
      // @ts-ignore regarder si on peut narrow l'élément value
      props.updateElement({ ...props.elementWithValue, value: heritage.value })
    }
    props.updateHeritage({
      actif: heritage.heritee,
      etape: props.elementHeritage.etape,
    })
  }

  const heritageValue = valueWithHeritage.value.etapeHeritee?.value ?? null
  const hasHeritageValue: boolean = isNotNullNorUndefined(heritageValue) && Array.isArray(heritageValue) ? isNotNullNorUndefinedNorEmpty(heritageValue) : isNotNullNorUndefined(heritageValue)

  return (
    <HeritageEdit
      prop={valueWithHeritage.value}
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
