import { defineComponent, FunctionalComponent, ref } from 'vue'
import { utilisateurApiClient } from '@/components/utilisateur/utilisateur-api-client'
import { DsfrInput } from '@/components/_ui/dsfr-input'
import { DsfrButton } from '@/components/_ui/dsfr-button'

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
              <p class="fr-h5">Abonnez-vous à notre lettre d’information</p>
            </div>
            <div>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  onSubscribe()
                }}
              >
                <div class="fr-input-group">
                  <label class="fr-label" for="newsletter-email">
                    {' '}
                    Votre adresse électronique (ex. : nom@domaine.fr){' '}
                  </label>
                  <div class="fr-input-wrap fr-input-wrap--addon">
                    <DsfrInput
                      legend={{ main: 'Votre adresse électronique (ex. : nom@domaine.fr)', placeholder: 'Votre adresse électronique (ex. : nom@domaine.fr)' }}
                      type={{ type: 'email' }}
                      valueChanged={onEmailInput}
                    />
                    <DsfrButton title="S‘abonner à notre lettre d’information" label="S‘abonner" disabled={state === 'SUBSCRIBING'} type="submit" onClick={() => {}} />
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
          await utilisateurApiClient.newsletterInscrire(email.value)
          email.value = ''
          subscribed.value = 'SUBSCRIBED'
        } catch (e: any) {
          console.error(e)
          subscribed.value = 'ERROR'
        }
      }
    }

    return () => <PureNewsletterForm state={subscribed.value} onEmailInput={e => (email.value = e)} onSubscribe={() => subscribe()} />
  },
})
