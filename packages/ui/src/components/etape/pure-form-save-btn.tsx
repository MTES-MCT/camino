import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { HTMLAttributes, defineComponent, ref } from 'vue'
import { Alert } from '../_ui/alert'
import { DsfrButton, DsfrLink } from '../_ui/dsfr-button'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'

export type EtapeAlerte = { message: string; url?: string }
type Props = {
  alertes: EtapeAlerte[]
  canSave: boolean
  canDepose: boolean
  showDepose: boolean
  initialContext?: AsyncData<undefined>
  save: () => Promise<void>
  depose: () => Promise<void>
} & Pick<HTMLAttributes, 'class' | 'style'>
export const PureFormSaveBtn = defineComponent<Props>(props => {
  const saveContext = ref<AsyncData<undefined>>(isNotNullNorUndefined(props.initialContext) ? props.initialContext : { status: 'LOADED', value: undefined })

  const save = async () => {
    saveContext.value = { status: 'LOADING' }
    try {
      await props.save()
      saveContext.value = { status: 'LOADED', value: undefined }
    } catch (e: any) {
      console.error('error', e)
      saveContext.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  }
  const depose = async () => {
    saveContext.value = { status: 'LOADING' }
    try {
      await props.depose()
      saveContext.value = { status: 'LOADED', value: undefined }
    } catch (e: any) {
      console.error('error', e)
      saveContext.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  }

  return () => (
    <div class={props.class} style={props.style}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {props.alertes?.map(alerte => (
          <Alert
            key={alerte.message}
            small={true}
            type="warning"
            title={
              <>
                {isNotNullNorUndefinedNorEmpty(alerte.url) ? (
                  <DsfrLink disabled={false} icon={null} title={alerte.message} href={alerte.url} target="_blank">
                    {alerte.url}
                  </DsfrLink>
                ) : (
                  alerte.message
                )}
              </>
            }
          />
        ))}

        {saveContext.value.status === 'ERROR' ? <Alert small={true} type="error" title={saveContext.value.message} /> : null}

        <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }} class="fr-mt-2w">
          {saveContext.value.status !== 'ERROR' ? <LoadingElement data={saveContext.value} renderItem={() => null} /> : null}

          <DsfrButton
            buttonType={props.showDepose ? 'secondary' : 'primary'}
            class="fr-ml-2w"
            type={props.showDepose ? 'button' : 'submit'}
            disabled={!props.canSave || saveContext.value.status === 'LOADING'}
            onClick={save}
            title="Enregistrer l'étape"
          >
            Enregistrer
          </DsfrButton>
          {props.showDepose ? (
            <DsfrButton
              buttonType="primary"
              type="submit"
              class="fr-ml-2w"
              title="Enregistrer puis déposer l'étape"
              disabled={!props.canDepose || saveContext.value.status === 'LOADING'}
              onClick={depose}
            >
              Enregistrer et déposer
            </DsfrButton>
          ) : null}
        </div>
      </div>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureFormSaveBtn.props = ['alertes', 'canSave', 'canDepose', 'showDepose', 'save', 'depose', 'class', 'style', 'initialContext']
