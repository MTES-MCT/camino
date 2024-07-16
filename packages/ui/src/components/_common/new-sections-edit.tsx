import { computed, defineComponent, ref, watch, DeepReadonly } from 'vue'
import { ElementWithValue, isNumberElement, isRadioElement, SectionWithValue } from 'camino-common/src/sections'
import { exhaustiveCheck, isNonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { numberFormat } from 'camino-common/src/number'
import { sectionElementWithValueCompleteValidate, sectionsWithValueCompleteValidate } from 'camino-common/src/permissions/sections'
import { DsfrInput } from '../_ui/dsfr-input'
import { DsfrTextarea } from '../_ui/dsfr-textarea'
import { DsfrInputCheckbox } from '../_ui/dsfr-input-checkbox'
import { DsfrInputCheckboxes } from '../_ui/dsfr-input-checkboxes'
import { capitalize } from 'camino-common/src/strings'
import { DsfrInputRadio } from '../_ui/dsfr-input-radio'
import { DsfrSelect } from '../_ui/dsfr-select'
import { useState } from '../../utils/vue-tsx-utils'
import { CaminoDate, dateAddDays, dateFormat } from 'camino-common/src/date'
interface Props {
  sectionsWithValue: DeepReadonly<SectionWithValue[]>
  completeUpdate: (complete: boolean, newContenu: Props['sectionsWithValue']) => void
  etapeDate: CaminoDate | null
}

export const SectionsEdit = defineComponent<Props>(props => {
  const [sectionsWithValue, setSectionsWithValue] = useState<DeepReadonly<SectionWithValue[]>>([])

  watch(
    () => props.sectionsWithValue,
    () => {
      setSectionsWithValue([...props.sectionsWithValue])
      props.completeUpdate(sectionsWithValueCompleteValidate(props.sectionsWithValue).length === 0, props.sectionsWithValue)
    },
    { immediate: true }
  )

  const onValueChange = (elementIndex: number, sectionIndex: number) => (elementWithValue: DeepReadonly<ElementWithValue>) => {
    const newSectionsWithValue: DeepReadonly<SectionWithValue[]> = sectionsWithValue.value.map((section, index) => {
      if (index === sectionIndex) {
        return {
          ...section,
          elements: section.elements.map((element, oldElementIndex) => {
            if (oldElementIndex === elementIndex) {
              return elementWithValue
            } else {
              return element
            }
          }),
        }
      } else {
        return section
      }
    })
    setSectionsWithValue(newSectionsWithValue)

    const complete: boolean = sectionsWithValueCompleteValidate(newSectionsWithValue).length === 0
    props.completeUpdate(complete, newSectionsWithValue)
  }

  return () => (
    <div>
      {sectionsWithValue.value.map((sectionWithValue, sectionIndex) => (
        <fieldset key={sectionWithValue.id} class="fr-fieldset" aria-labelledby={isNotNullNorUndefinedNorEmpty(sectionWithValue.nom) ? `${sectionWithValue.id}-legend` : undefined}>
          {isNotNullNorUndefinedNorEmpty(sectionWithValue.nom) ? (
            <legend class="fr-fieldset__legend" id={`${sectionWithValue.id}-legend`}>
              {sectionWithValue.nom}
            </legend>
          ) : null}

          {sectionWithValue.elements.map((element, elementIndex) => (
            <div class="fr-fieldset__element">
              <SectionElementEdit key={element.id} element={element} onValueChange={onValueChange(elementIndex, sectionIndex)} sectionId={sectionWithValue.id} etapeDate={props.etapeDate} />
            </div>
          ))}
        </fieldset>
      ))}
    </div>
  )
})
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
SectionsEdit.props = ['sectionsWithValue', 'completeUpdate', 'etapeDate']

interface SectionElementEditProps {
  element: DeepReadonly<ElementWithValue>
  onValueChange: (value: SectionElementEditProps['element']) => void
  sectionId: string
  etapeDate: CaminoDate | null
}

export const getInfo = (element: DeepReadonly<ElementWithValue>, sectionId: string, etapeDate: CaminoDate | null): string => {
  if (isNotNullNorUndefined(element.value)) {
    if (element.id === 'volumeGranulatsExtrait' && isNumberElement(element)) {
      return `Soit l’équivalent de ${numberFormat(element.value * 1.5)} tonnes`
    }
    if (sectionId === 'opdp' && element.id === 'duree' && isNumberElement(element) && isNotNullNorUndefined(etapeDate)) {
      const dateFin = dateAddDays(etapeDate, element.value)
      return `Du ${dateFormat(etapeDate)} au ${dateFormat(dateFin)}`
    }
  }

  return ''
}

export const SectionElementEdit = defineComponent<SectionElementEditProps>(props => {
  const complete = ref<boolean>(sectionElementWithValueCompleteValidate(props.element))

  const onValueChange = (value: DeepReadonly<ElementWithValue>) => {
    complete.value = sectionElementWithValueCompleteValidate(value)
    props.onValueChange(value)
  }

  const element = props.element
  const info = computed<string>(() => {
    return getInfo(props.element, props.sectionId, props.etapeDate)
  })

  const required = !(props.element.optionnel ?? false)
  switch (element.type) {
    case 'integer':
    case 'number':
      return () => (
        <div>
          <DsfrInput
            type={{ type: 'number', min: 0 }}
            required={required}
            initialValue={element.value}
            valueChanged={(e: number | null) => onValueChange({ ...element, value: e })}
            legend={{ main: element.nom ?? '', description: element.description, info: info.value }}
          />
        </div>
      )
    case 'date':
      return () => (
        <div>
          <DsfrInput
            type={{ type: 'date' }}
            required={required}
            initialValue={element.value}
            valueChanged={(date: CaminoDate | null) => {
              onValueChange({ ...element, value: date })
            }}
            legend={{ main: element.nom ?? '', description: element.description }}
          />
        </div>
      )
    case 'textarea':
      return () => (
        <div>
          <DsfrTextarea
            required={required}
            initialValue={element.value ?? undefined}
            valueChanged={(e: string) => onValueChange({ ...element, value: e })}
            legend={{ main: element.nom ?? '', description: element.description }}
          />
        </div>
      )

    case 'text':
    case 'url':
      return () => (
        <div>
          <DsfrInput
            required={required}
            type={{ type: 'text' }}
            initialValue={element.value}
            valueChanged={(e: string) => onValueChange({ ...element, value: e })}
            legend={{ main: element.nom ?? '', description: element.description }}
          />
        </div>
      )

    case 'radio':
      return () => (
        <div>
          <DsfrInputRadio
            id={props.element.id}
            required={required}
            legend={{ main: element.nom ?? '', description: element.description }}
            valueChanged={(radio: string) => onValueChange({ ...element, value: radio === 'oui' })}
            elements={[
              { legend: { main: 'Oui' }, itemId: 'oui' },
              { legend: { main: 'Non' }, itemId: 'non' },
            ]}
            initialValue={isNullOrUndefined(props.element.value) || !isRadioElement(props.element) ? null : props.element.value ? 'oui' : 'non'}
          />
        </div>
      )

    case 'checkbox':
      return () => (
        <div>
          <DsfrInputCheckbox
            initialValue={element.value}
            legend={{ main: element.nom ?? '', description: element.description }}
            valueChanged={(e: boolean) => onValueChange({ ...element, value: e })}
          />
        </div>
      )

    case 'checkboxes':
      return () => (
        <div>
          <DsfrInputCheckboxes
            legend={{ main: element.nom ?? '', description: element.description }}
            elements={element.options.map(option => {
              return { itemId: option.id, legend: { main: capitalize(option.nom) } }
            })}
            initialCheckedValue={(props.element.value ?? []) as string[]}
            valueChanged={newValues => onValueChange({ ...element, value: newValues })}
          />
        </div>
      )
    case 'select': {
      const options = element.options.map(option => ({ id: option.id, label: option.nom }))
      if (isNonEmptyArray(options)) {
        return () => (
          <div>
            <DsfrSelect
              required={required}
              legend={{ main: element.nom ?? '', description: element.description }}
              items={options}
              initialValue={element.value}
              valueChanged={newValue => onValueChange({ ...element, value: newValue })}
            />
          </div>
        )
      } else {
        throw new Error('Select sans option, cas impossible ?')
      }
    }

    default:
      exhaustiveCheck(element)
  }

  return () => <div></div>
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
SectionElementEdit.props = ['element', 'onValueChange', 'sectionId', 'etapeDate']
