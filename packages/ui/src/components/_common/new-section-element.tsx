import { ElementWithValue, isNumberElement, valeurFind } from 'camino-common/src/sections'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import { numberFormat } from 'camino-common/src/number'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import type { JSX } from 'vue/jsx-runtime'

type Props = {
  element: ElementWithValue
} & Pick<HTMLAttributes, 'class'>

export const SectionElement: FunctionalComponent<Props> = (props: Props): JSX.Element => {
  const hasNom: boolean = isNotNullNorUndefinedNorEmpty(props.element.nom)
  const hasDescription: boolean = isNotNullNorUndefinedNorEmpty(props.element.description)

  return (
    <div>
      {hasNom ? <div class="fr-text--lg fr-m-0">{props.element.nom}</div> : null}
      <div>
        {props.element.type === 'url' ? (
          <a target="_blank" rel="noopener noreferrer" href={valeurFind(props.element)} title={`${props.element.nom} - Lien externe`}>
            {valeurFind(props.element)}
          </a>
        ) : (
          <span>
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
          </span>
        )}

        {hasDescription ? (
          <span class="fr-hint-text">
            <span innerHTML={props.element.description} />
          </span>
        ) : null}
      </div>
    </div>
  )
}
