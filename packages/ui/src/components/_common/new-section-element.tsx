import { numberFormat } from '@/utils/number-format'
import { Icon } from '@/components/_ui/icon'
import {
  Element,
  isCheckboxesElement,
  isFileElement,
  isSelectElement,
  isNumberElement,
  isRadioElement,
  isDateElement
} from 'camino-common/src/titres'
import { dateFormat } from '../../utils'

export interface Props {
  element: Element
  fileDownload: (file: string) => void
}

const valeurFind = (element: Props['element']) => {
  const myContenu = element.value

  if (myContenu === undefined || myContenu === '') {
    return '–'
  }

  if (isNumberElement(element)) {
    return numberFormat(element.value)
  }

  if (isCheckboxesElement(element)) {
    return element.value
      .map(id => {
        const option = element.options.find(e => e.id === id)
        return option ? option.nom : undefined
      })
      .filter(valeur => !!valeur)
      .join(', ')
  }

  if (isSelectElement(element)) {
    return element.options.find(v => v.id === element.value)?.nom
  }

  if (isDateElement(element)) {
    return dateFormat(element.value)
  }

  if (isRadioElement(element)) {
    if (element.value === true) return 'Oui'
    else if (element.value === false) return 'Non'
  }

  return myContenu
}

export const SectionElement = (props: Props): JSX.Element => {
  return (
    <div class="tablet-blobs">
      {props.element.nom ? (
        <div class="tablet-blob-1-4">
          <h5>{props.element.nom}</h5>
        </div>
      ) : null}
      <div class={`${props.element.nom ? 'tablet-blob-3-4' : 'tablet-blob-1'}`}>
        {isFileElement(props.element) ? (
          <div class="flex h6 pb-xs">
            <span class="mt-xs flex bold">
              <Icon size="S" name="file" class="mr-xs" />
              {props.element.value.slice(5)}
            </span>

            {props.element.value ? (
              <button
                class="btn-border py-xs px-s rnd-xs flex-right mt--xs"
                onClick={() =>
                  isFileElement(props.element)
                    ? props.fileDownload(props.element.value)
                    : {}
                }
              >
                <Icon size="M" name="download" />
              </button>
            ) : null}
          </div>
        ) : (
          <p class={`cap-first ${props.element.description ? 'mb-s' : ''}`}>
            {valeurFind(props.element)}
            {props.element.id === 'volumeGranulatsExtrait' &&
            isNumberElement(props.element) ? (
              <span>
                m3. Soit l’équivalent de{' '}
                {numberFormat(props.element.value * 1.5)} tonnes.
              </span>
            ) : null}
          </p>
        )}

        {props.element.description ? (
          <p class="h6">
            <span innerHTML={props.element.description} />
          </p>
        ) : null}
      </div>
    </div>
  )
}
