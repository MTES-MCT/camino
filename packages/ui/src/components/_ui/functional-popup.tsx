import { AsyncData } from '@/api/client-rest'
import { Teleport, computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { LoadingElement } from './functional-loader'
import type { JSX } from 'vue/jsx-runtime'
import { CaminoError } from 'camino-common/src/zod-tools'
import { createFocusTrap, FocusTrap } from 'focus-trap'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

interface Props<T> {
  id?: string
  title: string
  content: () => JSX.Element
  close: () => void
  validate: {
    text?: string
    action: () => Promise<CaminoError<string> | T>
  }
  canValidate: boolean
}

export const FunctionalPopup = defineComponent(<T,>(props: Props<T>) => {
  const canValidate = computed<boolean>(() => {
    return props.canValidate
  })
  const dialogRef = ref<HTMLDialogElement | null>(null)
  const trap = ref<FocusTrap | null>(null)
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
        const value: CaminoError<string> | T = await props.validate.action()
        if (typeof value === 'object' && value !== null && 'message' in value) {
          validateProcess.value = {
            status: 'NEW_ERROR',
            error: value,
          }
        } else {
          validateProcess.value = {
            status: 'LOADED',
            value: null,
          }
          props.close()
        }
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
    if (isNotNullNorUndefined(dialogRef.value)) {
      if (!devMode) {
        trap.value = createFocusTrap(dialogRef.value)
        trap.value.activate()
      }
    } else {
      console.error("Impossible de mettre en place focus-trap, le composant de dialogue n'est pas présent")
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keyup', keyUp)
    if (isNotNullNorUndefined(trap.value)) {
      trap.value.deactivate()
    }
  })

  const stopPropagation = (e: Event) => {
    e.stopPropagation()
  }

  const devMode: boolean = process.env.VITEST === 'true' || import.meta.env.STORYBOOK === 'true'

  return () => (
    // TODO 2023-11-28 ici on interdit le teleport dans le cas de vitest pour que les snapshots soient présentes. On a pas trouvé mieux à cette date
    <Teleport to="body" disabled={devMode}>
      <div>
        <dialog ref={dialogRef} id={id} class="fr-modal fr-modal--opened" open={true} aria-modal={true} role="dialog" aria-labelledby={`${id}-title`} onClick={props.close} style={{ zIndex: 1000001 }}>
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
                      {validateProcess.value.status === 'ERROR' || validateProcess.value.status === 'NEW_ERROR' ? (
                        <LoadingElement class="fr-mt-4v" data={validateProcess.value} renderItem={() => null} />
                      ) : null}
                    </div>
                  </div>

                  <div class="fr-modal__footer">
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'end', alignItems: 'center', gap: '1rem' }}>
                      {validateProcess.value.status !== 'ERROR' && validateProcess.value.status !== 'NEW_ERROR' ? <LoadingElement data={validateProcess.value} renderItem={() => null} /> : null}
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
