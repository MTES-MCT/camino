import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import { Alert } from '../_ui/alert'
import { DsfrButton, DsfrLink } from '../_ui/dsfr-button'

export type EtapeAlerte = { message: string; url?: string }
type Props = {
  alertes: EtapeAlerte[]
  canSave: boolean
  canDepose: boolean
  showDepose: boolean

  save: () => void
  depose: () => void
} & Pick<HTMLAttributes, 'class' | 'style'>
export const PureFormSaveBtn: FunctionalComponent<Props> = props => {
  return (
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

        <div style={{ display: 'flex', justifyContent: 'end' }} class="fr-mt-2w">
          <DsfrButton buttonType={props.showDepose ? 'secondary' : 'primary'} type={props.showDepose ? 'button' : 'submit'} disabled={!props.canSave} onClick={props.save} title="Enregistrer l'étape">
            Enregistrer
          </DsfrButton>
          {props.showDepose ? (
            <DsfrButton buttonType="primary" type="submit" class="fr-ml-2w" title="Enregistrer puis déposer l'étape" disabled={!props.canDepose} onClick={props.depose}>
              Enregistrer et déposer
            </DsfrButton>
          ) : null}
        </div>
      </div>
    </div>
  )
}
