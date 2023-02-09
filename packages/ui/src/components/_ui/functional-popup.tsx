import { AsyncData } from '@/api/client-rest'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { LoadingElement } from './functional-loader'

interface Props {
  header: () => JSX.Element
  content: () => JSX.Element
  close: () => void
  canValidate: boolean
  validate: () => Promise<void>
}

// FIXME STORYBOOK
export const FunctionalPopup = defineComponent<Props>({
  props: ['header', 'content', 'close', 'validate', 'canValidate' ]as unknown as undefined, 
  setup(props: Props) {
    const validateButton = ref<HTMLButtonElement | null>(null)

    const keyup = (e: KeyboardEvent) =>  {
      if ((e.which || e.keyCode) === 27) {
        props.close()
      } else if ((e.which || e.keyCode) === 13) {
        if (props.canValidate) {
          validateButton.value?.focus()
          props.validate()
        }
      }
    }
    
    onMounted(() => {
      document.addEventListener('keyup', keyup)
    })
    
    onUnmounted(() => {
      document.removeEventListener('keyup', keyup)
    })

    const validateProcess = ref<AsyncData<null>>({status: "LOADED", value: null })

    const validate = async () => {
      if (props.canValidate) {
        validateProcess.value = {
          status: 'LOADING'
        }
        try {
          await props.validate()
          validateProcess.value = {
            status: 'LOADED', value: null
          }
        } catch (e: any) {
          console.error('error', e)
          validateProcess.value = {
            status: 'ERROR',
            message: e.message ?? 'something wrong happened'
          }
        }
      props.close()
    }
  }

  // FIXME 2023-02-09 : close on click out of modal
  return () => <div class="absolute full bg-inverse-alpha z-2">
    <div class="popup fixed shadow full bg-bg">
      <div class="popup-header px-l pt-l">
        {props.header()}
      </div>
      <div class="popup-content px-l pt">
        {props.content()}
      </div>
      <div class="popup-footer px-l pt pb-l">
        <div class="tablet-blobs">
        <div class="tablet-blob-1-3 mb tablet-mb-0">
          <button class="btn-border rnd-xs p-s full-x" onClick={() => props.close()}>
            Annuler
          </button>
        </div>
        <div class="tablet-blob-2-3">
          <LoadingElement data={validateProcess.value} renderItem={() => <button
            ref={validateButton}
            disabled={!props.canValidate}
            class={`${!props.canValidate ? 'disabled': ''} btn btn-primary`}
            onClick={() => validate()}
          >
            Enregistrer
          </button>} />
        </div>
      </div>
      </div>
    </div>
</div>
}})