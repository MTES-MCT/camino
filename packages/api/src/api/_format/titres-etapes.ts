import { FlattenEtape, defaultHeritageProps, flattenEtapeValidator, heritageContenuValidator } from 'camino-common/src/etape-form'
import { simpleContenuToFlattenedContenu } from 'camino-common/src/sections'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { ITitreEtape } from '../../types'

import { titreEtapeFormatFields } from './_fields'
import { titreDemarcheFormat } from './titres-demarches'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { titreEtapeForMachineValidator } from '../../business/rules-demarches/machine-common'
import { z } from 'zod'
import { Effect } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'
import { zodParseEffect, ZodUnparseable } from '../../tools/fp-tools'

const getPerimetreFromITitreEtape = (
  titreEtape: Pick<
    ITitreEtape,
    'geojson4326Perimetre' | 'geojson4326Points' | 'geojsonOriginePerimetre' | 'geojsonOriginePoints' | 'geojson4326Forages' | 'geojsonOrigineForages' | 'geojsonOrigineGeoSystemeId' | 'surface'
  >
): FlattenEtape['perimetre']['value'] => ({
  geojson4326Perimetre: titreEtape.geojson4326Perimetre ?? null,
  geojson4326Points: titreEtape.geojson4326Points ?? null,
  geojsonOriginePerimetre: titreEtape.geojsonOriginePerimetre ?? null,
  geojsonOriginePoints: titreEtape.geojsonOriginePoints ?? null,
  geojson4326Forages: titreEtape.geojson4326Forages ?? null,
  geojsonOrigineForages: titreEtape.geojsonOrigineForages ?? null,
  geojsonOrigineGeoSystemeId: titreEtape.geojsonOrigineGeoSystemeId ?? null,
  surface: titreEtape.surface ?? null,
})

const apiFlattenEtapeValidator = flattenEtapeValidator.and(titreEtapeForMachineValidator.pick({ concurrence: true, hasTitreFrom: true, demarcheIdsConsentement: true }))
export type ApiFlattenEtape = z.infer<typeof apiFlattenEtapeValidator>

const pasDeDemarcheOuDeTitreCharge = 'pas de démarche ou de titre chargé' as const
const pasDeDemarcheChargee = 'pas de démarche chargée' as const
const pasDHeritageCharge = "pas d'héritage chargé" as const
const pasDeSlug = 'pas de slug' as const
export type TitreEtapeToFlattenEtapeErrors = typeof pasDeDemarcheOuDeTitreCharge | typeof pasDeDemarcheChargee | typeof pasDHeritageCharge | typeof pasDeSlug | ZodUnparseable
export const iTitreEtapeToFlattenEtape = (titreEtape: ITitreEtape): Effect.Effect<ApiFlattenEtape, CaminoError<TitreEtapeToFlattenEtapeErrors>> => {
  return Effect.Do.pipe(
    Effect.bind('titreTypeId', () => {
      const titreTypeId = titreEtape.demarche?.titre?.typeId
      if (isNotNullNorUndefined(titreTypeId)) {
        return Effect.succeed(titreTypeId)
      }
      return Effect.fail({ message: pasDeDemarcheOuDeTitreCharge })
    }),
    Effect.bind('demarcheTypeId', () => {
      const demarcheTypeId = titreEtape.demarche?.typeId
      if (isNullOrUndefined(demarcheTypeId)) {
        return Effect.fail({ message: pasDeDemarcheChargee })
      }
      return Effect.succeed(demarcheTypeId)
    }),
    Effect.bind('heritageProps', () => {
      const heritageProps = EtapesTypes[titreEtape.typeId].fondamentale ? titreEtape.heritageProps : defaultHeritageProps
      if (isNullOrUndefined(heritageProps)) {
        return Effect.fail({ message: pasDHeritageCharge })
      }
      return Effect.succeed(heritageProps)
    }),
    Effect.bind('slug', () => {
      const slug = titreEtape.slug
      if (isNullOrUndefined(slug)) {
        return Effect.fail({ message: pasDeSlug })
      }
      return Effect.succeed(slug)
    }),
    Effect.bind('heritageContenu', () => zodParseEffect(heritageContenuValidator, titreEtape.heritageContenu)),
    Effect.bind('contenu', ({ titreTypeId, demarcheTypeId, heritageContenu }) =>
      Effect.succeed(simpleContenuToFlattenedContenu(titreTypeId, demarcheTypeId, titreEtape.typeId, titreEtape.contenu ?? {}, heritageContenu))
    ),
    Effect.map(({ heritageProps, slug, contenu }) => {
      const flattenEtape: FlattenEtape = {
        ...titreEtape,
        slug,
        note: isNotNullNorUndefined(titreEtape.note)
          ? titreEtape.note
          : {
              valeur: '',
              is_avertissement: false,
            },
        duree: {
          value: (heritageProps.duree.actif ? heritageProps.duree.etape?.duree : titreEtape.duree) ?? null,
          heritee: heritageProps.duree.actif,
          etapeHeritee: isNotNullNorUndefined(heritageProps.duree.etape)
            ? {
                etapeTypeId: heritageProps.duree.etape.typeId,
                date: heritageProps.duree.etape.date,
                value: heritageProps.duree.etape.duree ?? null,
              }
            : null,
        },
        perimetre: {
          value: heritageProps.perimetre.actif
            ? isNotNullNorUndefined(heritageProps.perimetre.etape)
              ? getPerimetreFromITitreEtape(heritageProps.perimetre.etape)
              : null
            : getPerimetreFromITitreEtape(titreEtape),

          heritee: heritageProps.perimetre.actif,
          etapeHeritee: isNotNullNorUndefined(heritageProps.perimetre.etape)
            ? {
                etapeTypeId: heritageProps.perimetre.etape.typeId,
                date: heritageProps.perimetre.etape.date,
                value: getPerimetreFromITitreEtape(heritageProps.perimetre.etape),
              }
            : null,
        },
        dateDebut: {
          value: (heritageProps.dateDebut.actif ? heritageProps.dateDebut.etape?.dateDebut : titreEtape.dateDebut) ?? null,
          heritee: heritageProps.dateDebut.actif,
          etapeHeritee: isNotNullNorUndefined(heritageProps.dateDebut.etape)
            ? {
                etapeTypeId: heritageProps.dateDebut.etape.typeId,
                date: heritageProps.dateDebut.etape.date,
                value: heritageProps.dateDebut.etape.dateDebut ?? null,
              }
            : null,
        },
        dateFin: {
          value: (heritageProps.dateFin.actif ? heritageProps.dateFin.etape?.dateFin : titreEtape.dateFin) ?? null,
          heritee: heritageProps.dateFin.actif,
          etapeHeritee: isNotNullNorUndefined(heritageProps.dateFin.etape)
            ? {
                etapeTypeId: heritageProps.dateFin.etape.typeId,
                date: heritageProps.dateFin.etape.date,
                value: heritageProps.dateFin.etape.dateFin ?? null,
              }
            : null,
        },
        substances: {
          value: (heritageProps.substances.actif ? (isNotNullNorUndefined(heritageProps.substances.etape) ? heritageProps.substances.etape.substances : []) : titreEtape.substances) ?? [],

          heritee: heritageProps.substances.actif,
          etapeHeritee: isNotNullNorUndefined(heritageProps.substances.etape)
            ? {
                etapeTypeId: heritageProps.substances.etape.typeId,
                date: heritageProps.substances.etape.date,
                value: heritageProps.substances.etape.substances ?? [],
              }
            : null,
        },
        amodiataires: {
          value:
            (heritageProps.amodiataires.actif ? (isNotNullNorUndefined(heritageProps.amodiataires.etape) ? heritageProps.amodiataires.etape.amodiataireIds : []) : titreEtape.amodiataireIds) ?? [],

          heritee: heritageProps.amodiataires.actif,
          etapeHeritee: isNotNullNorUndefined(heritageProps.amodiataires.etape)
            ? {
                etapeTypeId: heritageProps.amodiataires.etape.typeId,
                date: heritageProps.amodiataires.etape.date,
                value: heritageProps.amodiataires.etape.amodiataireIds ?? [],
              }
            : null,
        },
        titulaires: {
          value: (heritageProps.titulaires.actif ? (isNotNullNorUndefined(heritageProps.titulaires.etape) ? heritageProps.titulaires.etape.titulaireIds : []) : titreEtape.titulaireIds) ?? [],

          heritee: heritageProps.titulaires.actif,
          etapeHeritee: isNotNullNorUndefined(heritageProps.titulaires.etape)
            ? {
                etapeTypeId: heritageProps.titulaires.etape.typeId,
                date: heritageProps.titulaires.etape.date,
                value: heritageProps.titulaires.etape.titulaireIds ?? [],
              }
            : null,
        },
        contenu,
      }
      return flattenEtape
    }),

    // On zod parse ici pour enlever les champs supplémentaires qu'il y'a par exemple dans perimetre
    Effect.flatMap(flattenEtape => zodParseEffect(apiFlattenEtapeValidator, flattenEtape))
  )
}
export const titreEtapeFormat = (titreEtape: ITitreEtape, fields = titreEtapeFormatFields): ITitreEtape => {
  if (titreEtape.demarche) {
    titreEtape.demarche = titreDemarcheFormat(titreEtape.demarche, fields.demarche)
  }

  return titreEtape
}
