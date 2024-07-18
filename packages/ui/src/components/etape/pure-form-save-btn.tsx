import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { HTMLAttributes, defineComponent, ref } from 'vue'
import { Alert } from '../_ui/alert'
import { DsfrButton, DsfrLink } from '../_ui/dsfr-button'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'

export type EtapeAlerte = { message: string; url?: string }
type Props = {
  alertes: EtapeAlerte[]
  canSave: boolean
  canDepose: boolean
  showDepose: boolean
  initialContext?: AsyncData<undefined>
  save: () => Promise<void>
  depose: () => void
  etapeTypeId: EtapeTypeId
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
          />
          {props.showDepose ? (
            <DsfrButton
              buttonType="primary"
              type="submit"
              class="fr-ml-2w"
              title={props.etapeTypeId === 'mfr' ? "Enregistrer puis déposer l'étape" : "Enregistrer puis finaliser l'étape"}
              disabled={!props.canDepose || saveContext.value.status === 'LOADING'}
              onClick={props.depose}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureFormSaveBtn.props = ['alertes', 'canSave', 'canDepose', 'showDepose', 'save', 'depose', 'class', 'style', 'initialContext', 'etapeTypeId']
