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
import { valeurFind } from 'camino-common/src/sections'
import { EntrepriseDocuments } from '../etape/entreprise-documents'
import { EtapeDocuments } from '../etape/etape-documents'
import { User } from 'camino-common/src/roles'

// Il ne faut pas utiliser de literal dans le 'in' il n'y aura jamais d'erreur typescript
const fondamentalePropsName = 'fondamentale'

type Props = CommonDemarcheEtape & {
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
    (fondamentalePropsName in props && getValues(props.fondamentale).some(v => isNotNullNorUndefined(v) && (!Array.isArray(v) || v.length > 0))) || props.sections_with_values.length > 0

  return (
    <div class="fr-pt-1w fr-pb-1w fr-pl-2w fr-pr-2w" style={{ border: '1px solid var(--grey-900-175)' }}>
      <div class="fr-text--lg fr-mb-1v" style={{ color: 'var(--text-title-blue-france)', fontWeight: '500' }}>
        {capitalize(EtapesTypes[props.etape_type_id].nom)}
      </div>
      {displayEtapeStatus(props.etape_type_id, props.etape_statut_id) ? <EtapeStatut etapeStatutId={props.etape_statut_id} /> : null}
      <div class="fr-mt-1w">
        <DsfrIcon name="fr-icon-calendar-line" color="text-title-blue-france" /> {dateFormat(props.date)}
      </div>

      {hasContent ? <DsfrSeparator /> : null}

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
                <EtapePropItem title={element.nom ?? element.id} text={valeurFind(element)} />
              ))}
          </>
        ))}
      </div>

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
