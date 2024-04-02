import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { FunctionalComponent } from 'vue'
import { Alert } from '../_ui/alert'
import { DsfrButton, DsfrLink } from '../_ui/dsfr-button'

type Props = {
  alertes?: { message: string; url: string }[]
  canSave: boolean
  canDepose: boolean
  showDepose: boolean

  save: () => void
  depose: () => void
}
export const PureFormSaveBtn: FunctionalComponent<Props> = props => {
  return (
    <div class="dsfr">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {props.alertes?.map(alerte => (
          <Alert
            key={alerte.message}
            small={true}
            type="warning"
            title={
              <>
                {isNotNullNorUndefined(alerte.url) && alerte.url.length > 0 ? (
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

        <div style={{ display: 'flex', justifyContent: 'end' }} class="fr-mt-2w">
          <DsfrButton buttonType={props.showDepose ? 'secondary' : 'primary'} disabled={!props.canSave} onClick={props.save} title="Enregistrer l'étape">
            Enregistrer
          </DsfrButton>
          {props.showDepose ? (
            <DsfrButton buttonType="primary" class="fr-ml-2w" title="Enregistrer puis déposer l'étape" disabled={!props.canDepose} onClick={props.depose}>
              Enregistrer et déposer
            </DsfrButton>
          ) : null}
        </div>
      </div>
    </div>
  )
}
