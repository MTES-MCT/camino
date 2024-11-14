import { DemarcheConsentement, DemarcheEtape, DemarcheSlug } from 'camino-common/src/demarche'
import { computed, defineComponent, FunctionalComponent } from 'vue'
import { DeepReadonly, isNotNullNorUndefined, isNullOrUndefined, PickDistributive } from 'camino-common/src/typescript-tools'
import { Alert } from '../_ui/alert'
import { DsfrLink } from '../_ui/dsfr-button'
import { ETAPE_TYPE_FOR_CONSENTEMENT_DATA, ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
export type Props = {
  demarcheSlug: DemarcheSlug
  titre: {
    demarches: { slug: DemarcheSlug; etapes: PickDistributive<DemarcheEtape, 'etape_type_id' | 'demarches_consentement'>[] }[]
  }
}

export const getDemandesConsentement = (demarche: Pick<Props['titre']['demarches'][number], 'etapes'> | undefined): null | DemarcheConsentement[] => {
  if (isNotNullNorUndefined(demarche)) {
    const etapeDemande = demarche.etapes.find(({ etape_type_id }) => etape_type_id === ETAPE_TYPE_FOR_CONSENTEMENT_DATA)

    const etapeDemandeConsentement = demarche.etapes.find(({ etape_type_id }) => etape_type_id === ETAPES_TYPES.demandeDeConsentement)

    const demandeDemarchesConsentement: DemarcheConsentement[] = etapeDemande?.demarches_consentement ?? []
    if (isNullOrUndefined(etapeDemandeConsentement) && demandeDemarchesConsentement.length > 0) {
      return demandeDemarchesConsentement
    }
  }
  return null
}

export const DemarchesConsentement = defineComponent<Props>(props => {
  const demarchesConsentement = computed<null | DemarcheConsentement[]>(() => {
    const demarche = props.titre.demarches.find(({ slug }) => slug === props.demarcheSlug)
    return getDemandesConsentement(demarche)
  })

  return () => (
    <>
      {isNotNullNorUndefined(demarchesConsentement.value) ? (
        <Alert class="fr-mt-2w" type="warning" title="Demande de consentement à faire" description={<DemarchesConsentementLoaded demarches={demarchesConsentement.value} />} />
      ) : null}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DemarchesConsentement.props = ['demarcheSlug', 'titre']

const DemarchesConsentementLoaded: FunctionalComponent<{ demarches: DeepReadonly<DemarcheConsentement[]> }> = ({ demarches }) => {
  return (
    <>
      <span> Les titres suivants sont valides et concernent au moins une substance en commun avec cette demande :</span>
      <ul>
        {demarches.map(demarche => (
          <li>
            <DsfrLink title={demarche.titreNom} disabled={false} icon={null} to={{ name: 'demarche', params: { demarcheId: demarche.demarcheId } }} />
          </li>
        ))}
      </ul>
    </>
  )
}
