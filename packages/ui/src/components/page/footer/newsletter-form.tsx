import { defineComponent, FunctionalComponent, ref } from 'vue'
import { newsletterInscrire } from '@/api/utilisateurs'
import { isEventWithTarget } from '@/utils/vue-tsx-utils'

type SubscribeState = 'NOT_SUBSCRIBED' | 'SUBSCRIBED' | 'SUBSCRIBING' | 'ERROR'

type Props = {
  state: SubscribeState
  onEmailInput: (s: string) => void
  onSubscribe: () => void
}

export const PureNewsletterForm: FunctionalComponent<Props> = ({ state, onEmailInput, onSubscribe }: Props) => (
  <div class="fr-follow">
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <div class="fr-follow__newsletter">
            <div>
              <h2 class="fr-h5">Abonnez-vous à notre lettre d’information</h2>
            </div>
            <div>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  onSubscribe()
                }}
              >
                <div class="fr-input-group fr-input-group--error">
                  <label class="fr-label" for="newsletter-email">
                    {' '}
                    Votre adresse électronique (ex. : nom@domaine.fr){' '}
                  </label>
                  <div class="fr-input-wrap fr-input-wrap--addon">
                    <input
                      class={`fr-input ${state === 'ERROR' ? 'fr-input--error' : ''}`}
                      title="Votre adresse électronique (ex. : nom@domaine.fr)"
                      autocomplete="email"
                      aria-describedby="newsletter-email-hint-text newsletter-email-messages"
                      placeholder="Votre adresse électronique (ex. : nom@domaine.fr)"
                      id="newsletter-email"
                      type="email"
                      onInput={event => (isEventWithTarget(event) ? onEmailInput(event.target.value) : null)}
                    />
                    <button
                      class={`fr-btn ${state === 'SUBSCRIBED' ? 'fr-btn--icon-left fr-icon-checkbox-circle-line' : ''}`}
                      id="newsletter-button"
                      title="S‘abonner à notre lettre d’information"
                      disabled={state === 'SUBSCRIBING'}
                      type="submit"
                    >
                      {' '}
                      S'abonner
                    </button>
                  </div>
                  {state === 'ERROR' ? (
                    <p id="text-input-error-desc-error" class="fr-error-text">
                      Une erreur est survenue.
                    </p>
                  ) : null}
                  <div class="fr-messages-group" id="newsletter-email-messages" aria-live="assertive"></div>
                </div>
                <p id="newsletter-email-hint-text" class="fr-hint-text">
                  En renseignant votre adresse électronique, vous acceptez de recevoir nos actualités par courriel. Vous pouvez vous désinscrire à tout moment à l’aide des liens de désinscription ou
                  en nous contactant.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export const NewsletterForm = defineComponent({
  setup() {
    const email = ref<string>('')
    const subscribed = ref<SubscribeState>('NOT_SUBSCRIBED')

    const subscribe = async () => {
      if (email.value) {
        try {
          subscribed.value = 'SUBSCRIBING'
          await newsletterInscrire({
            email: email.value,
          })
          email.value = ''
          subscribed.value = 'SUBSCRIBED'
        } catch (e: any) {
          console.error(e)
          subscribed.value = 'ERROR'
        }
      }
    }

    return () => (
      <div>
        <PureNewsletterForm state={subscribed.value} onEmailInput={e => (email.value = e)} onSubscribe={() => subscribe()} />
      </div>
    )
  },
})
