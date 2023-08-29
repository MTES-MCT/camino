import { Icon } from '@/components/_ui/icon'
import { ElementWithValue, isFileElement, isNumberElement, valeurFind } from 'camino-common/src/titres'
import { FunctionalComponent } from 'vue'
import { ButtonIcon } from '../_ui/button-icon'
import { numberFormat } from 'camino-common/src/number'

export interface Props {
  element: ElementWithValue
  fileDownload: (file: string) => void
}

export const SectionElement: FunctionalComponent<Props> = (props: Props): JSX.Element => {
  return (
    <div class="tablet-blobs">
      {props.element.nom ? (
        <div class="tablet-blob-1-4">
          <h5>{props.element.nom}</h5>
        </div>
      ) : null}
      <div class={`${props.element.nom ? 'tablet-blob-3-4' : 'tablet-blob-1'}`}>
        {props.element.value && isFileElement(props.element) ? (
          <div class="flex h6 pb-xs">
            <span class="mt-xs flex bold">
              <Icon size="S" name="file" class="mr-xs" aria-hidden="true" />
              {props.element.value.slice(5)}
            </span>
            <ButtonIcon
              class="btn-border py-xs px-s rnd-xs flex-right mt--xs"
              onClick={() => (props.element.value && isFileElement(props.element) ? props.fileDownload(props.element.value) : {})}
              icon="download"
              title="Télécharger le fichier"
            />
          </div>
        ) : (
          <p class={`cap-first ${props.element.description ? 'mb-s' : ''}`}>
            {valeurFind(props.element)}
            {props.element.id === 'volumeGranulatsExtrait' && props.element.value !== null && isNumberElement(props.element) ? (
              <span>m3. Soit l’équivalent de {numberFormat(props.element.value * 1.5)} tonnes.</span>
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
