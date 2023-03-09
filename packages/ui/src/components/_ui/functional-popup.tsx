import { AsyncData } from '@/api/client-rest'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { LoadingElement } from './functional-loader'

interface Props {
  title: string
  content: () => JSX.Element
  close: () => void
  validate: {
    can?: boolean
    text?: string
    action: () => Promise<void>
  }
}

export const FunctionalPopup = caminoDefineComponent<Props>(['title', 'content', 'close', 'validate'], (props: Props) => {
  const canValidate = computed<boolean>(() => {
    return props.validate.can ?? true
  })
  const text = props.validate.text ?? 'Enregistrer'
  const validateButton = ref<HTMLButtonElement | null>(null)

  const keyup = (e: KeyboardEvent) => {
    if ((e.which || e.keyCode) === 27) {
      props.close()
    } else if ((e.which || e.keyCode) === 13) {
      if (canValidate.value) {
        validateButton.value?.focus()
      }
    }
  }

  onMounted(() => {
    validateButton.value?.focus()
    document.addEventListener('keyup', keyup)
  })

  onUnmounted(() => {
    document.removeEventListener('keyup', keyup)
  })

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
      } catch (e: any) {
        console.error('error', e)
        validateProcess.value = {
          status: 'ERROR',
          message: e.message ?? 'something wrong happened',
        }
      }
      props.close()
    }
  }

  return () => (
    <div class="absolute full bg-inverse-alpha z-2" onClick={() => props.close()}>
      <div class="popup fixed shadow full bg-bg" onClick={e => e.stopPropagation()}>
        <div class="popup-header px-l pt-l">
          <h2>{props.title}</h2>
        </div>
        <div class="popup-content px-l pt">{props.content()}</div>
        <div class="popup-footer px-l pt pb-l">
          <div class="tablet-blobs">
            <div class="tablet-blob-1-3 mb tablet-mb-0">
              <button class="btn-border rnd-xs p-s full-x" onClick={() => props.close()}>
                Annuler
              </button>
            </div>
            <div class="tablet-blob-2-3">
              <LoadingElement
                data={validateProcess.value}
                renderItem={() => (
                  <button
                    ref={validateButton}
                    disabled={!canValidate.value}
                    class={`${!canValidate.value ? 'disabled' : ''} btn btn-primary`}
                    onClick={e => {
                      e.stopPropagation()
                      return validate()
                    }}
                  >
                    {text}
                  </button>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
