import type { ApiClient } from '@/api/api-client'
import { AsyncData } from '@/api/client-rest'
import { canHaveMiseEnConcurrence, DemarcheEtape, DemarcheId, demarcheIdValidator, GetDemarcheMiseEnConcurrence } from 'camino-common/src/demarche'
import { computed, defineComponent, FunctionalComponent, ref } from 'vue'
import { LoadingElement } from '../_ui/functional-loader'
import { DeepReadonly, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, PickDistributive } from 'camino-common/src/typescript-tools'
import { Alert } from '../_ui/alert'
import { DsfrLink } from '../_ui/dsfr-button'
import { ETAPE_TYPE_FOR_CONCURRENCY_DATA, ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { isAdministrationRole, isSuperRole, UserNotNull } from 'camino-common/src/roles'
import { watch } from 'vue'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { machineIdFind } from 'camino-common/src/machines'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
export type Props = {
  apiClient: Pick<ApiClient, 'getDemarcheMiseEnConcurrence'>
  titre: {
    titre_type_id: TitreTypeId
    demarches: { id: DemarcheId; demarche_type_id: DemarcheTypeId; etapes: PickDistributive<DemarcheEtape, 'etape_type_id' | 'demarche_id_en_concurrence' | 'date' | 'etape_statut_id'>[] }[]
  }
  user: Pick<UserNotNull, 'role'> | null
  hasTitresFrom: boolean | 'LOADING'
}
export const DemarcheMiseEnConcurrence = defineComponent<Props>(props => {
  type AsyncDemarches = AsyncData<DeepReadonly<GetDemarcheMiseEnConcurrence[]>>
  type Conf = null | { type: 'hasAlert'; demarches: AsyncDemarches; demarcheId: DemarcheId } | { type: 'mayHaveAlert'; demarches: AsyncDemarches; demarcheId: DemarcheId }

  const conf = ref<Conf>({
    type: 'mayHaveAlert',
    demarches: {
      status: 'LOADING',
    },
    demarcheId: demarcheIdValidator.parse('totoId'),
  })

  watch(
    () => props.hasTitresFrom,
    async () => {
      const hasTitresFrom = props.hasTitresFrom
      if (hasTitresFrom === 'LOADING') {
        return
      }

      conf.value = null

      const demarchesSansResultat = props.titre.demarches
        .filter(({ demarche_type_id, etapes, id }) => {
          const machineId = machineIdFind(
            props.titre.titre_type_id,
            demarche_type_id,
            etapes.map(etape => ({ ...etape, typeId: etape.etape_type_id })),
            id
          )

          return machineId === 'ProcedureSpecifique' && canHaveMiseEnConcurrence(demarche_type_id, hasTitresFrom)
        })
        .reduce<{ id: DemarcheId; hasAnf: boolean }[]>((acc, demarche) => {
          const hasAnf: boolean = demarche.etapes.some(etape => etape.etape_type_id === ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF)
          const hasResultatAnf: boolean = demarche.etapes.some(etape => etape.etape_type_id === ETAPES_TYPES.resultatMiseEnConcurrence)

          if (!hasResultatAnf) {
            acc.push({ id: demarche.id, hasAnf })
          }
          return acc
        }, [])

      if (isNotNullNorUndefinedNorEmpty(demarchesSansResultat)) {
        const demarcheWithAnf = demarchesSansResultat.find(({ hasAnf }) => hasAnf)

        if (isNotNullNorUndefined(demarcheWithAnf)) {
          conf.value = { type: 'hasAlert', demarches: { status: 'LOADING' }, demarcheId: demarcheWithAnf.id }
        } else {
          const getDemarcheIdPivot = (demarches: Props['titre']['demarches']) => {
            for (const demarche of demarches) {
              for (const etape of demarche.etapes) {
                if (etape.etape_type_id === ETAPE_TYPE_FOR_CONCURRENCY_DATA && isNotNullNorUndefined(etape.demarche_id_en_concurrence)) {
                  const hasResultatAnf: boolean = demarche.etapes.some(etape => etape.etape_type_id === ETAPES_TYPES.resultatMiseEnConcurrence)

                  if (!hasResultatAnf) {
                    return etape.demarche_id_en_concurrence
                  }
                }
              }
            }
          }

          const demarcheId = getDemarcheIdPivot(props.titre.demarches) ?? null

          if (isNotNullNorUndefined(demarcheId)) {
            conf.value = { type: 'hasAlert', demarches: { status: 'LOADING' }, demarcheId }
          } else if (isNotNullNorUndefined(props.user) && (isSuperRole(props.user.role) || isAdministrationRole(props.user.role))) {
            conf.value = { type: 'mayHaveAlert', demarches: { status: 'LOADING' }, demarcheId: demarchesSansResultat[0].id }
          }
        }

        if (isNotNullNorUndefined(conf.value)) {
          const result = await props.apiClient.getDemarcheMiseEnConcurrence(conf.value.demarcheId)
          if ('message' in result) {
            conf.value.demarches = {
              status: 'ERROR',
              message: result.message,
            }
          } else {
            const currentDemarcheIds = props.titre.demarches.map(({ id }) => id)
            conf.value.demarches = { status: 'LOADED', value: result.filter(({ demarcheId }) => !currentDemarcheIds.includes(demarcheId)) }
          }
        }
      }
    },
    { immediate: true }
  )

  const alerteType = computed<'warning' | 'info'>(() => {
    if (conf.value?.demarches.status === 'LOADED' && conf.value.demarches.value.length === 0) {
      return 'info'
    }

    return 'warning'
  })

  const alertTitle = computed<string>(() => {
    if (conf.value?.type === 'hasAlert') {
      const demarcheId = conf.value.demarcheId
      const demarche = props.titre.demarches.find(({ id }) => id === demarcheId)
      const anf = demarche?.etapes.find(({ etape_type_id }) => etape_type_id === ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF)

      if (isNotNullNorUndefined(anf)) {
        switch (anf.etape_statut_id) {
          case ETAPES_STATUTS.PROGRAMME:
            return 'Concurrence de fait'
          case ETAPES_STATUTS.EN_COURS:
            return 'Mise en concurrence en cours'
          case ETAPES_STATUTS.TERMINE:
            return 'Mise en concurrence terminée'
        }
      }
    }
    return 'Démarche en superposition avec une demande déjà déposée'
  })

  return () => (
    <>
      {isNotNullNorUndefined(conf.value) ? (
        <>
          {conf.value.type === 'hasAlert' ? (
            <Alert
              class="fr-mt-2w"
              type={alerteType.value}
              title={alertTitle.value}
              description={<LoadingElement data={conf.value.demarches} renderItem={item => <DemarcheMiseEnConcurrenceLoaded demarches={item} />} />}
            />
          ) : (
            <LoadingElement
              data={conf.value.demarches}
              renderItem={items => (
                <>
                  {isNotNullNorUndefinedNorEmpty(items) ? (
                    <Alert class="fr-mt-2w" type={alerteType.value} title="Concurrence de fait" description={<DemarcheMiseEnConcurrenceLoaded demarches={items} />} />
                  ) : null}
                </>
              )}
            />
          )}
        </>
      ) : null}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DemarcheMiseEnConcurrence.props = ['apiClient', 'titre', 'user', 'hasTitresFrom']

const DemarcheMiseEnConcurrenceLoaded: FunctionalComponent<{ demarches: DeepReadonly<GetDemarcheMiseEnConcurrence[]> }> = ({ demarches }) => {
  return (
    <>
      {demarches.length === 0 ? (
        <span>Aucune demande n'est actuellement en concurrence avec cette demande.</span>
      ) : (
        <ul>
          Les demandes suivantes sont en concurrence avec cette demande :
          {demarches.map(demarche => (
            <li>
              <DsfrLink title={demarche.titreNom} disabled={false} icon={null} to={{ name: 'demarche', params: { demarcheId: demarche.demarcheId } }} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
