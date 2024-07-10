import type { CaminoError } from 'camino-common/src/zod-tools'
import type { FunctionalComponent, HTMLAttributes } from 'vue'
import type { JSX } from 'vue/jsx-runtime'
type SmallProps = {
  small: true
}
type ClassicProps = {
  description?: string | JSX.Element
}

type Props = {
  type: 'warning' | 'success' | 'error' | 'info'
  title: string | JSX.Element
} & (SmallProps | ClassicProps) & { class?: HTMLAttributes['class']; style?: HTMLAttributes['style'] }

export const Alert: FunctionalComponent<Props> = props => {
  if ('small' in props) {
    return (
      <div class={['fr-alert', `fr-alert--${props.type}`, 'fr-alert--sm']}>
        <p>{props.title}</p>
      </div>
    )
  } else {
    return (
      <div class={['fr-alert', `fr-alert--${props.type}`]}>
        <h3 class="fr-alert__title">{props.title}</h3>
        {props.description !== undefined ? props.description : null}
      </div>
    )
  }
}

export const CaminoApiAlert: FunctionalComponent<{ caminoApiError: CaminoError<string>; class?: HTMLAttributes['class'] }> = props => {
  const small = !('zodErrorReadableMessage' in props.caminoApiError || 'detail' in props.caminoApiError)
  if (small) {
    return <Alert small={small} type="error" title={props.caminoApiError.message} />
  } else if ('zodErrorReadableMessage' in props.caminoApiError && 'detail' in props.caminoApiError) {
    return (
      <Alert
        type="error"
        title={props.caminoApiError.message}
        description={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>{props.caminoApiError.detail}</div>
            <div class="fr-message fr-mt-1w" style={{ marginBottom: 0 }}>
              <strong>Détail technique : </strong>
            </div>
            <div class="fr-message">{props.caminoApiError.zodErrorReadableMessage}</div>
          </div>
        }
      />
    )
  } else if ('zodErrorReadableMessage' in props.caminoApiError) {
    return <Alert type="error" title={props.caminoApiError.message} description={props.caminoApiError.zodErrorReadableMessage} />
  } else {
    return <Alert type="error" title={props.caminoApiError.message} description={props.caminoApiError.detail} />
  }
}

export const PageIntrouvableAlert: FunctionalComponent = () => {
  return <Alert type="error" title="Page Introuvable" small={true} />
}
// Demandé par le router car utilisé dans un import asynchrone /shrug
PageIntrouvableAlert.displayName = 'Page introuvable'
