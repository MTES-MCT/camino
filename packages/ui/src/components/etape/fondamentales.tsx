import { dateFormat } from '@/utils'
import { etablissementNameFind } from '../../utils/entreprise'
import { TagList } from '../_ui/tag-list'
import { Tag } from '../_ui/tag'
import { PropDuree } from './prop-duree'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales'
import { EtapeEntreprise, EtapeFondamentale } from 'camino-common/src/etape'
import { Entreprise } from 'camino-common/src/entreprise'
import { FunctionalComponent } from 'vue'

interface Props {
  etape: Pick<EtapeFondamentale, 'duree' | 'dateDebut' | 'dateFin' | 'date' | 'substances' | 'incertitudes'> & {
    titulaires: (Entreprise & EtapeEntreprise)[]
    amodiataires: (Entreprise & EtapeEntreprise)[]
  }
}

export const Fondamentales: FunctionalComponent<Props> = props => {
  return (
    <div>
      {props.etape.duree ? (
        <div class="tablet-blobs">
          <div class="tablet-blob-1-4">
            <h5>
              Durée
              {props.etape.incertitudes && props.etape.incertitudes.duree ? <Tag mini={true} color="bg-info" class="ml-xs" text="Incertain" /> : null}
            </h5>
          </div>
          <div class="tablet-blob-3-4">
            <p>
              <PropDuree duree={props.etape.duree} />
            </p>
          </div>
        </div>
      ) : null}

      {props.etape.dateDebut ? (
        <div class="tablet-blobs">
          <div class="tablet-blob-1-4">
            <h5>
              Date de début
              {props.etape.incertitudes && props.etape.incertitudes.dateDebut ? <Tag mini={true} color="bg-info" class="ml-xs" text="Incertain" /> : null}
            </h5>
          </div>
          <div class="tablet-blob-3-4">
            <p>{dateFormat(props.etape.dateDebut)}</p>
          </div>
        </div>
      ) : null}

      {props.etape.dateFin ? (
        <div class="tablet-blobs">
          <div class="tablet-blob-1-4">
            <h5>
              Date d'échéance
              {props.etape.incertitudes && props.etape.incertitudes.dateFin ? <Tag mini={true} color="bg-info" class="ml-xs" text="Incertain" /> : null}
            </h5>
          </div>
          <div class="tablet-blob-3-4">
            <p>{dateFormat(props.etape.dateFin)}</p>
          </div>
        </div>
      ) : null}

      {props.etape.titulaires && props.etape.titulaires.length ? (
        <div class="tablet-blobs">
          <div class="tablet-blob-1-4">
            <h5>
              Titulaire{props.etape.titulaires.length > 1 ? 's' : ''}
              {props.etape.incertitudes && props.etape.incertitudes.titulaires ? <Tag mini={true} color="bg-info" class="ml-xs" text="Incertain" /> : null}
            </h5>
          </div>
          <div class="tablet-blob-3-4">
            <ul class="list-prefix mb">
              {props.etape.titulaires.map(t => (
                <li key={t.id}>
                  {etablissementNameFind(t.etablissements, props.etape.date) || t.nom}
                  {t.operateur ? <Tag mini={true} color="bg-info" class="ml-xs" text=" Opérateur " /> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {props.etape.amodiataires && props.etape.amodiataires.length ? (
        <div class="tablet-blobs">
          <div class="tablet-blob-1-4">
            <h5>
              Amodiataire{props.etape.amodiataires.length > 1 ? 's' : ''}
              {props.etape.incertitudes && props.etape.incertitudes.amodiataires ? <Tag mini={true} color="bg-info" class="ml-xs" text="Incertain" /> : null}
            </h5>
          </div>
          <div class="tablet-blob-3-4">
            <ul class="list-prefix">
              {props.etape.amodiataires.map(t => (
                <li key={t.id}>{etablissementNameFind(t.etablissements, props.etape.date) || t.nom}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {props.etape.substances && props.etape.substances?.length ? (
        <div class="tablet-blobs">
          <div class="tablet-blob-1-4">
            <h5>
              Substance{props.etape.substances?.length > 1 ? 's' : ''}
              {props.etape.incertitudes && props.etape.incertitudes.substances ? <Tag mini={true} color="bg-info" class="ml-xs" text="Incertain" /> : null}
            </h5>
          </div>
          <div class="tablet-blob-3-4">
            <TagList elements={props.etape.substances?.map(substanceId => SubstancesLegale[substanceId].nom)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
