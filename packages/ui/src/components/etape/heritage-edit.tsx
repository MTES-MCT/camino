import { dateFormat } from 'camino-common/src/date'
import { HTMLAttributes } from 'vue'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DsfrToggle } from '../_ui/dsfr-toggle'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { capitalize, slugify } from 'camino-common/src/strings'
import type { JSX } from 'vue/jsx-runtime'
import { DsfrInput } from '@/components/_ui/dsfr-input'
import { FlattenedContenuElement, FlattenEtape } from 'camino-common/src/etape-form'
import { fr } from '@codegouvfr/react-dsfr'

type HeritagePossible =
  | FlattenEtape['perimetre']
  | FlattenEtape['dateDebut']
  | FlattenEtape['dateFin']
  | FlattenEtape['titulaires']
  | FlattenEtape['amodiataires']
  | FlattenEtape['duree']
  | FlattenEtape['substances']
  | FlattenedContenuElement

type Props<T extends HeritagePossible> = {
  prop: T
  write: () => JSX.Element
  required: boolean
  read: (heritagePropEtape?: NoInfer<T>['etapeHeritee']) => JSX.Element
  label: string
  hasHeritageValue: boolean
  class?: HTMLAttributes['class']
  updateHeritage: (update: NoInfer<T>) => void
}

export const HeritageEdit = <T extends HeritagePossible>(props: Props<T>): JSX.Element => {
  const updateHeritage = () => {
    const etapeHeritee = props.prop.etapeHeritee
    const newHeritage = !props.prop.heritee
    if (!newHeritage) {
      props.updateHeritage({ ...props.prop, heritee: newHeritage })
    } else if (isNotNullNorUndefined(etapeHeritee)) {
      props.updateHeritage({ ...props.prop, value: etapeHeritee?.value ?? null, heritee: newHeritage })
    }
  }

  const dummyValueChanged = () => {}
  // TODO 2024-05-14 WTF! Sans la clé il récupère un ancien input et le modifie que à moitié. Le bug est présent sur le champ « Durée » quand on a passe d’une valeur saisie à un héritage Non Renseigné
  const dummyKey = `empty_input_${self.crypto.randomUUID()}`

  const etapeHeritee = props.prop.etapeHeritee ?? null
  return (
    <div class={['fr-mb-1w', props.class]}>
      {!props.prop.heritee ? (
        props.write()
      ) : (
        <div>
          {props.hasHeritageValue ? (
            props.read(etapeHeritee)
          ) : (
            <DsfrInput
              id={slugify(props.label)}
              key={dummyKey}
              type={{ type: 'text' }}
              disabled={true}
              required={props.required}
              initialValue={'Non renseigné'}
              legend={{ main: props.label, visible: true }}
              valueChanged={dummyValueChanged}
            />
          )}
        </div>
      )}

      {isNotNullNorUndefined(etapeHeritee) ? (
        <div class={[fr.cx('fr-pt-2w'), fr.cx('fr-pb-2w')]}>
          <DsfrToggle
            id={`heritage_${slugify(props.label)}`}
            initialValue={props.prop.heritee}
            valueChanged={updateHeritage}
            legendLabel={`Hériter de l’étape "${capitalize(EtapesTypes[etapeHeritee.etapeTypeId].nom)}" du ${dateFormat(etapeHeritee.date)}`}
          />
        </div>
      ) : null}
    </div>
  )
}
