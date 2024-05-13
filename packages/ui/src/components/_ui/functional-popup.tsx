import { AsyncData } from '@/api/client-rest'
import { Teleport, computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { LoadingElement } from './functional-loader'
import type { JSX } from 'vue/jsx-runtime'
import { Alert } from './alert'

interface Props {
  id?: string
  title: string
  content: () => JSX.Element
  close: () => void
  validate: {
    text?: string
    action: () => Promise<void>
  }
  canValidate: boolean
}

export const FunctionalPopup = defineComponent<Props>((props: Props) => {
  const canValidate = computed<boolean>(() => {
    return props.canValidate
  })

  const id = props.id ?? 'monId'
  const text = props.validate.text ?? 'Enregistrer'

  const validateProcess = ref<AsyncData<null>>({
    status: 'LOADED',
    value: null,
  })

  const validate = async () => {
    if (canValidate.value) {
      validateProcess.value = {
        status: 'LOADING',
      }
      try {
        await props.validate.action()
        validateProcess.value = {
          status: 'LOADED',
          value: null,
        }
        props.close()
      } catch (e: any) {
        console.error('error', e)
        validateProcess.value = {
          status: 'ERROR',
          message: e.message ?? 'something wrong happened',
        }
      }
    }
  }

  const keyUp = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.close()
    }
  }

  onMounted(async () => {
    document.addEventListener('keyup', keyUp)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keyup', keyUp)
  })

  const stopPropagation = (e: Event) => {
    e.stopPropagation()
  }

  return () => (
    // TODO 2023-11-28 ici on interdit le teleport dans le cas de vitest pour que les snapshots soient présentes. On a pas trouvé mieux à cette date
    <Teleport to="body" disabled={process.env.VITEST === 'true'}>
      <div>
        <dialog id={id} class="fr-modal fr-modal--opened" open={true} aria-modal={true} role="dialog" aria-labelledby={`${id}-title`} onClick={props.close} style={{ zIndex: 1000001 }}>
          <div class="fr-container fr-container--fluid fr-container-md" onClick={stopPropagation}>
            <div class="fr-grid-row fr-grid-row--center">
              <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
                <div class="fr-modal__body">
                  <div class="fr-modal__header">
                    <button class="fr-btn--close fr-btn" aria-controls={id} title="Fermer" onClick={() => props.close()}>
                      Fermer
                    </button>
                  </div>
                  <div class="fr-modal__content">
                    <h1 id={`${id}-title`} class="fr-modal__title">
                      <span class="fr-icon-arrow-right-line fr-icon--lg" aria-hidden="true"></span>
                      {props.title}
                    </h1>
                    <div class="fr-container">
                      {props.content()}
                      {validateProcess.value.status === 'ERROR' ? <Alert small={true} type="error" title={validateProcess.value.message} /> : null}
                    </div>
                  </div>

                  <div class="fr-modal__footer">
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'end', alignItems: 'center', gap: '1rem' }}>
                      {validateProcess.value.status !== 'ERROR' ? <LoadingElement data={validateProcess.value} renderItem={() => null} /> : null}
                      <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left" style={{ width: 'auto' }}>
                        <li>
                          <button
                            class={['fr-btn', 'fr-icon-check-line', 'fr-btn--icon-left', !canValidate.value ? 'disabled' : '']}
                            disabled={!canValidate.value || validateProcess.value.status === 'LOADING'}
                            onClick={e => {
                              e.stopPropagation()

                              return validate()
                            }}
                          >
                            {text}
                          </button>
                        </li>
                        <li>
                          <button
                            class="fr-btn fr-icon-arrow-go-back-fill fr-btn--icon-left fr-btn--secondary"
                            disabled={validateProcess.value.status === 'LOADING'}
                            aria-controls={id}
                            onClick={props.close}
                          >
                            Annuler
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </dialog>
      </div>
    </Teleport>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
FunctionalPopup.props = ['id', 'title', 'content', 'close', 'validate', 'canValidate']
