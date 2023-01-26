import { ReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { Pill } from '../_ui/pill'
import { Tag } from '../_ui/tag'
import { TagList } from '../_ui/tag-list'
import { Dot } from '../_ui/dot'
import Section from '../_common/section.vue'
import { Statut } from '../_common/statut'
import { dateFormat } from '@/utils'
import PureTitresLinkForm from './pure-titres-link-form.vue'
import { User } from 'camino-common/src/roles'
import {
  getDomaineId,
  getTitreTypeType,
  TitreTypeId
} from 'camino-common/src/static/titresTypes'
import {
  DemarchesTypes,
  DemarcheTypeId
} from 'camino-common/src/static/demarchesTypes'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import {
  SubstanceLegaleId,
  SubstancesLegale
} from 'camino-common/src/static/substancesLegales'
import {
  TitresStatuts,
  TitreStatutId
} from 'camino-common/src/static/titresStatuts'
import {
  PhaseStatutId,
  phaseStatuts
} from 'camino-common/src/static/phasesStatuts'
import { TitreReference } from 'camino-common/src/titres-references'
import { ApiClient } from '@/api/api-client'
import { LoadingElement } from '@/components/_ui/functional-loader'

export interface Entreprise {
  id: string
  nom: string
  legalSiren?: string
  operateur: boolean
}

export interface Props {
  titre: {
    id: string
    typeId: TitreTypeId
    titreStatutId: TitreStatutId
    demarches: {
      id: string
      type: { id: DemarcheTypeId }
      phase: {
        dateDebut: string
        dateFin: string
        phaseStatutId: PhaseStatutId
      }
    }[]
    contenu: { [sectionId: string]: { [elementId: string]: unknown } }
    administrations: AdministrationId[]
    titulaires: Entreprise[]
    amodiataires: Entreprise[]
    substances: SubstanceLegaleId[]
    references: TitreReference[]
  }
  user: User
  apiClient: Pick<
    ApiClient,
    'loadTitreLinks' | 'loadLinkableTitres' | 'linkTitres'
  >
}

const Entreprises = ({
  entreprises,
  label
}: {
  entreprises: Entreprise[] | undefined
  label: 'Titulaire' | 'Amodiataire'
}): JSX.Element | null => {
  return entreprises?.length ? (
    <div class="mb">
      <h5>{entreprises.length > 1 ? `${label}s` : label}</h5>
      <ul class="list-inline">
        {entreprises.map(e => (
          <li key={e.id} class="mb-xs mr-xs">
            <router-link
              to={{ name: 'entreprise', params: { id: e.id } }}
              class="btn-border small p-s rnd-xs mr-xs"
            >
              <span class="mr-xs">
                {e.legalSiren ? `${e.nom} (${e.legalSiren})` : e.nom}
              </span>

              {e.operateur ? (
                <Tag
                  mini={true}
                  color="bg-info"
                  class="ml-xs"
                  text="Opérateur"
                />
              ) : null}
            </router-link>
          </li>
        ))}
      </ul>
    </div>
  ) : null
}

const InfosSections = ({
  titre
}: {
  titre: Pick<Props['titre'], 'id' | 'contenu'>
}): JSX.Element | null => {
  if (!titre.contenu) {
    return null
  }
  const hasContenu = titre.type.sections?.some(s =>
    s.elements.some(
      e => titre.contenu[s.id] && titre.contenu[s.id][e.id] !== undefined
    )
  )

  const renderItem = (sections: any[]): JSX.Element | null =>
    sections?.length ? (
      <>
        {sections.map(s => (
          <Section
            key={s.id}
            entete={false}
            section={s}
            contenu={titre.contenu[s.id]}
          />
        ))}
      </>
    ) : null

  return <LoadingElement data={} renderItem={renderItem}></LoadingElement>
}

export const Infos = ({ titre, user, apiClient }: Props): JSX.Element => {
  const phases = titre.demarches.filter(d => d.phase)

  const titreStatut = TitresStatuts[titre.titreStatutId]

  return (
    <div class="desktop-blobs">
      <div class="desktop-blob-1-2">
        <div class="rnd-b-s bg-alt pt px overflow-auto">
          <h4 class="mb">
            <Pill
              color={`bg-domaine-${getDomaineId(titre.typeId)}`}
              class="mono mr-s"
            >
              {getDomaineId(titre.typeId)}
            </Pill>
            <span class="cap-first">
              {TitresTypesTypes[getTitreTypeType(titre.typeId)].nom}
            </span>
          </h4>

          <div class="mb">
            <Statut color={titreStatut.couleur} nom={titreStatut.nom} />
          </div>

          {phases && phases.length ? (
            <div class="mb bg-bg mx--m px-m pt-xs pb-s rnd-xs">
              <table class="table-xxs full-x mb-0">
                <tr>
                  <th class="max-width-1" />
                  <th>Phase</th>
                  <th>Début</th>
                  <th>Fin</th>
                </tr>
                {phases.map(demarche => (
                  <tr key={demarche.id}>
                    <td class="max-width-1">
                      <Dot
                        class="mt-xs"
                        color={`bg-${
                          phaseStatuts[demarche.phase.phaseStatutId].couleur
                        }`}
                      />
                    </td>
                    <td>
                      <span class="cap-first bold h5 mb-0">
                        {DemarchesTypes[demarche.type.id].nom}
                      </span>
                    </td>
                    <td>
                      <span class="h5 mb-0">
                        {dateFormat(demarche.phase.dateDebut)}
                      </span>
                    </td>
                    <td>
                      <span class="h5 mb-0">
                        {dateFormat(demarche.phase.dateFin)}
                      </span>
                    </td>
                  </tr>
                ))}
              </table>
            </div>
          ) : null}

          {titre.references && titre.references.length ? (
            <div class="mb">
              <ul class="list-prefix h6">
                {titre.references.map(reference => (
                  <li key={reference.nom}>
                    {reference.referenceTypeId ? (
                      <span class="word-break fixed-width bold">
                        {ReferencesTypes[reference.referenceTypeId].nom}
                      </span>
                    ) : null}
                    {reference.nom}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div class="desktop-blob-1-2 mt">
        <PureTitresLinkForm
          user={user}
          titre={{
            id: titre.id,
            typeId: titre.typeId,
            administrations: titre.administrations,
            demarches: titre.demarches.map(d => ({ typeId: d.type.id }))
          }}
          apiClient={apiClient}
        />

        {titre.substances?.length ? (
          <div class="mb">
            <h5>Substances</h5>
            <TagList
              elements={titre.substances?.map(
                substanceId => SubstancesLegale[substanceId].nom
              )}
            />
          </div>
        ) : null}

        <Entreprises entreprises={titre.titulaires} label={'Titulaire'} />
        <Entreprises entreprises={titre.amodiataires} label={'Amodiataire'} />

        <InfosSections />
      </div>
    </div>
  )
}
