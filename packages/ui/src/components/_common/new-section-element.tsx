import { ElementWithValue, isNumberElement, valeurFind } from 'camino-common/src/sections'
import { FunctionalComponent } from 'vue'
import { numberFormat } from 'camino-common/src/number'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

interface Props {
  element: ElementWithValue
}

export const SectionElement: FunctionalComponent<Props> = (props: Props): JSX.Element => {
  const hasNom: boolean = isNotNullNorUndefinedNorEmpty(props.element.nom)
  const hasDescription: boolean = isNotNullNorUndefinedNorEmpty(props.element.description)

  return (
    <div class="tablet-blobs">
      {hasNom ? (
        <div class="tablet-blob-1-4">
          <h5>{props.element.nom}</h5>
        </div>
      ) : null}
      <div class={`${hasNom ? 'tablet-blob-3-4' : 'tablet-blob-1'}`}>
        {props.element.type === 'url' ? (
          <a class={`${hasDescription ? 'mb-s' : ''}`} target="_blank" rel="noopener noreferrer" href={valeurFind(props.element)} title={`${props.element.nom} - Lien externe`}>
            {valeurFind(props.element)}
          </a>
        ) : (
          <p class={`cap-first ${hasDescription ? 'mb-s' : ''}`}>
            {props.element.id === 'jorf' && props.element.value !== null && props.element.value !== '' ? (
              <a target="_blank" rel="noopener noreferrer" href={`https://www.legifrance.gouv.fr/jorf/id/${valeurFind(props.element)}`} title={`Légifrance - Lien externe`}>
                {valeurFind(props.element)}
              </a>
            ) : (
              valeurFind(props.element)
            )}
            {props.element.id === 'volumeGranulatsExtrait' && props.element.value !== null && isNumberElement(props.element) ? (
              <span>m3. Soit l’équivalent de {numberFormat(props.element.value * 1.5)} tonnes.</span>
            ) : null}
          </p>
        )}

        {hasDescription ? (
          <p class="h6">
            <span innerHTML={props.element.description} />
          </p>
        ) : null}
      </div>
    </div>
  )
}
