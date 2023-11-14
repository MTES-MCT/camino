import { ETAPES_TYPES, EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { FunctionalComponent } from 'vue'
import { DsfrSeparator } from '../_ui/dsfr-separator'
import { capitalize } from 'camino-common/src/strings'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { dateFormat } from 'camino-common/src/date'
import { DsfrIcon } from '../_ui/icon'
import { EtapeStatut } from '../_common/etape-statut'
import { PropDuree } from '../etape/prop-duree'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales'
import { EtapePropEntreprisesItem, EtapePropItem } from '../etape/etape-prop-item'
import { DemarcheEtape as CommonDemarcheEtape } from 'camino-common/src/demarche'
import { DsfrPerimetre } from '../_common/dsfr-perimetre'
import { TitreSlug } from 'camino-common/src/titres'
import { Router } from 'vue-router'
import { numberFormat } from 'camino-common/src/number'
import { getValues, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { isNumberElement, valeurFind } from 'camino-common/src/sections'
import { EntrepriseDocuments } from '../etape/entreprise-documents'
import { EtapeDocuments } from '../etape/etape-documents'
import { User } from 'camino-common/src/roles'
import styles from './demarche-etape.module.css'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { PureDownloads } from '../_common/downloads'
import { canCreateOrEditEtape } from 'camino-common/src/permissions/titres-etapes'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
// Il ne faut pas utiliser de literal dans le 'in' il n'y aura jamais d'erreur typescript
const fondamentalePropsName = 'fondamentale'

type Props = CommonDemarcheEtape & {
  demarche: {
    titulaires: { id: EntrepriseId }[]
    administrationsLocales: AdministrationId[]
    demarche_type_id: DemarcheTypeId
  }
  titre: {
    typeId: TitreTypeId
    titreStatutId: TitreStatutId
  }
  titreSlug: TitreSlug
  router: Pick<Router, 'push'>
  user: User
}

const displayEtapeStatus = (etape_type_id: EtapeTypeId, etape_statut_id: EtapeStatutId): boolean => {
  switch (etape_type_id) {
    case ETAPES_TYPES.demande:
      return etape_statut_id !== ETAPES_STATUTS.FAIT
    default:
      return getEtapesStatuts(etape_type_id).length > 1
  }
}

export const DemarcheEtape: FunctionalComponent<Props> = props => {
  const hasContent: boolean =
    (fondamentalePropsName in props && getValues(props.fondamentale).some(v => isNotNullNorUndefined(v) && (!Array.isArray(v) || v.length > 0))) ||
    props.sections_with_values.some(section => section.elements.filter(element => valeurFind(element) !== '–').length > 0)

  const editEtapeButton = () => {
    // FIXME ajouter matomo comme pour preview.vue ?
    // FIXME ajouter matomo au bouton download ?
    // FIXME gérer les droits d'édition, suppression et dépôt

    props.router.push({
      name: 'etape-edition',
      params: { id: props.slug },
    })
  }
  const deleteEtapeButton = () => {
    // FIXME suppression de l'étape
  }
  const canDownloadZip: boolean = props.etape_type_id === ETAPES_TYPES.demande && (props.entreprises_documents.length > 0 || props.documents.length > 0)

  const canEditOrDeleteEtape: boolean = canCreateOrEditEtape(
    props.user,
    props.etape_type_id,
    props.etape_statut_id,
    props.demarche.titulaires,
    props.demarche.administrationsLocales,
    props.demarche.demarche_type_id,
    props.titre,
    'modification'
  )

  return (
    <div class="fr-pb-1w fr-pl-2w fr-pr-2w" style={{ border: '1px solid var(--grey-900-175)' }}>
      <div class={`${styles.sticky} fr-pt-1w`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div class="fr-text--lg fr-mb-0" style={{ color: 'var(--text-title-blue-france)', fontWeight: '500' }}>
            {capitalize(EtapesTypes[props.etape_type_id].nom)}
          </div>

          <div style={{ display: 'flex' }}>
            {canEditOrDeleteEtape ? (
              <>
                <DsfrButtonIcon icon={'fr-icon-edit-line'} class="fr-mr-1v" buttonType="secondary" title="Modifier l’étape" onClick={editEtapeButton} />
                <DsfrButtonIcon icon={'fr-icon-delete-bin-line'} class="fr-mr-1v" buttonType="secondary" title="Supprimer l’étape" onClick={deleteEtapeButton} />
              </>
            ) : null}
            {canDownloadZip ? (
              <PureDownloads
                class="fr-mr-1v"
                downloadTitle="Télécharger l’ensemble de la demande dans un fichier .zip"
                downloadRoute="/etape/zip/:etapeId"
                params={{ etapeId: props.id }}
                formats={['pdf']}
                route={{ query: {} }}
              />
            ) : null}
          </div>
        </div>
        {/* FIXME ajouter le bouton déposer
         <button
          v-if="etapeIsDemandeEnConstruction"
          class="btn btn-primary flex small rnd-0"
          :disabled="!deposable"
          :class="{ disabled: !deposable }"
          title="Déposer l’étape"
          aria-label="Déposer l’étape"
          :aria-controls="etape.id"
          @click="etapeDepot"
        >
          <span class="mt-xxs mb-xxs">Déposer…</span>
        </button> */}

        {displayEtapeStatus(props.etape_type_id, props.etape_statut_id) ? <EtapeStatut etapeStatutId={props.etape_statut_id} /> : null}
        <div class="fr-mt-1w">
          <DsfrIcon name="fr-icon-calendar-line" color="text-title-blue-france" /> {dateFormat(props.date)}
        </div>
      </div>

      {hasContent ? (
        <>
          <DsfrSeparator />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              alignContent: 'flex-start',
              columnGap: '10px',
              rowGap: '8px',
            }}
          >
            {fondamentalePropsName in props ? (
              <>
                {props.fondamentale.date_debut ? <EtapePropItem title="Date de début" text={dateFormat(props.fondamentale.date_debut)} /> : null}
                {props.fondamentale.duree !== null ? <EtapePropItem title="Durée" item={<PropDuree duree={props.fondamentale.duree} />} /> : null}
                {props.fondamentale.date_fin ? <EtapePropItem title="Date de fin" text={dateFormat(props.fondamentale.date_fin)} /> : null}
                {(props.fondamentale.substances?.length ?? 0) > 0 ? (
                  <EtapePropItem title="Substances" text={(props.fondamentale.substances ?? []).map(s => capitalize(SubstancesLegale[s].nom)).join(', ')} />
                ) : null}
                <EtapePropEntreprisesItem title="Titulaire" entreprises={props.fondamentale.titulaires} />
                <EtapePropEntreprisesItem title="Amodiataire" entreprises={props.fondamentale.amodiataires} />
                {props.fondamentale.surface !== null ? <EtapePropItem title="Surface" text={`${numberFormat(props.fondamentale.surface)} km² environ`} /> : null}
              </>
            ) : null}
            {props.sections_with_values.map(section => (
              <>
                {section.elements
                  .filter(element => valeurFind(element) !== '–')
                  .map(element => (
                    <>
                      <EtapePropItem
                        title={element.nom ?? element.id}
                        item={
                          <>
                            {element.type === 'url' ? (
                              <a target="_blank" rel="noopener noreferrer" href={valeurFind(element)} title={`${element.nom} - Lien externe`}>
                                {valeurFind(element)}
                              </a>
                            ) : (
                              <p class="cap-first">
                                {element.id === 'jorf' && element.value !== null && element.value !== '' ? (
                                  <a target="_blank" rel="noopener noreferrer" href={`https://www.legifrance.gouv.fr/jorf/id/${valeurFind(element)}`} title={`Légifrance - Lien externe`}>
                                    {valeurFind(element)}
                                  </a>
                                ) : (
                                  valeurFind(element)
                                )}
                                {element.id === 'volumeGranulatsExtrait' && element.value !== null && isNumberElement(element) ? (
                                  <span>m3. Soit l’équivalent de {numberFormat(element.value * 1.5)} tonnes.</span>
                                ) : null}
                              </p>
                            )}
                          </>
                        }
                      />
                    </>
                  ))}
              </>
            ))}
          </div>
        </>
      ) : null}

      {fondamentalePropsName in props && props.fondamentale.geojsonMultiPolygon !== null ? (
        <>
          <DsfrSeparator />
          <DsfrPerimetre titreSlug={props.titreSlug} apiClient={null} geojsonMultiPolygon={props.fondamentale.geojsonMultiPolygon} router={props.router} />
        </>
      ) : null}

      {props.entreprises_documents.length > 0 ? (
        <>
          <DsfrSeparator />
          <EntrepriseDocuments etapeEntrepriseDocuments={props.entreprises_documents} />
        </>
      ) : null}

      {props.documents.length > 0 ? (
        <>
          <DsfrSeparator />
          <EtapeDocuments etapeDocuments={props.documents} user={props.user} />
        </>
      ) : null}
    </div>
  )
}
