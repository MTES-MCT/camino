import { FlattenEtape, flattenEtapeValidator, heritageContenuValidator } from 'camino-common/src/etape-form.js'
import { simpleContenuToFlattenedContenu } from 'camino-common/src/sections.js'
import { DeepReadonly, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { ITitreEtape } from '../../types.js'

import { titreEtapeFormatFields } from './_fields.js'
import { titreDemarcheFormat } from './titres-demarches.js'

export const iTitreEtapeToFlattenEtape = (titreEtape: ITitreEtape): DeepReadonly<FlattenEtape> => {
  const titreTypeId = titreEtape.demarche?.titre?.typeId
  const demarcheTypeId = titreEtape.demarche?.typeId
  const heritageProps = titreEtape.heritageProps
  const heritageContenu = titreEtape.heritageContenu
  const slug = titreEtape.slug
  if (isNullOrUndefined(titreTypeId)) {
    throw new Error('pas de démarche ou de titre chargé')
  }
  if (isNullOrUndefined(demarcheTypeId)) {
    throw new Error('pas de démarche chargée')
  }
  if (isNullOrUndefined(heritageProps)) {
    throw new Error("pas d'héritage chargé")
  }

  if (isNullOrUndefined(slug)) {
    throw new Error("pas de slug")
  }
  const contenu = simpleContenuToFlattenedContenu(titreTypeId, demarcheTypeId, titreEtape.typeId, titreEtape.contenu ?? {}, heritageContenuValidator.parse(heritageContenu))
  const flattenEtape: FlattenEtape = {
    ...titreEtape,
    slug,
    notes: titreEtape.notes ?? null,
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
          ? {
              geojson4326Perimetre: heritageProps.perimetre.etape.geojson4326Perimetre ?? null,
              geojson4326Points: heritageProps.perimetre.etape.geojson4326Points ?? null,
              geojsonOriginePerimetre: heritageProps.perimetre.etape.geojsonOriginePerimetre ?? null,
              geojsonOriginePoints: heritageProps.perimetre.etape.geojsonOriginePoints ?? null,
              geojson4326Forages: heritageProps.perimetre.etape.geojson4326Forages ?? null,
              geojsonOrigineForages: heritageProps.perimetre.etape.geojsonOrigineForages ?? null,
              geojsonOrigineGeoSystemeId: heritageProps.perimetre.etape.geojsonOrigineGeoSystemeId ?? null,
              surface: heritageProps.perimetre.etape.surface ?? null,
            }
          : null
        : {
            geojson4326Perimetre: titreEtape.geojson4326Perimetre ?? null,
            geojson4326Points: titreEtape.geojson4326Points ?? null,
            geojsonOriginePerimetre: titreEtape.geojsonOriginePerimetre ?? null,
            geojsonOriginePoints: titreEtape.geojsonOriginePoints ?? null,
            geojson4326Forages: titreEtape.geojson4326Forages ?? null,
            geojsonOrigineForages: titreEtape.geojsonOrigineForages ?? null,
            geojsonOrigineGeoSystemeId: titreEtape.geojsonOrigineGeoSystemeId ?? null,
            surface: titreEtape.surface ?? null,
          },

      heritee: heritageProps.perimetre.actif,
      etapeHeritee: isNotNullNorUndefined(heritageProps.perimetre.etape)
        ? {
            etapeTypeId: heritageProps.perimetre.etape.typeId,
            date: heritageProps.perimetre.etape.date,
            value: {
              geojson4326Perimetre: heritageProps.perimetre.etape.geojson4326Perimetre ?? null,
              geojson4326Points: heritageProps.perimetre.etape.geojson4326Points ?? null,
              geojsonOriginePerimetre: heritageProps.perimetre.etape.geojsonOriginePerimetre ?? null,
              geojsonOriginePoints: heritageProps.perimetre.etape.geojsonOriginePoints ?? null,
              geojson4326Forages: heritageProps.perimetre.etape.geojson4326Forages ?? null,
              geojsonOrigineForages: heritageProps.perimetre.etape.geojsonOrigineForages ?? null,
              geojsonOrigineGeoSystemeId: heritageProps.perimetre.etape.geojsonOrigineGeoSystemeId ?? null,
              surface: heritageProps.perimetre.etape.surface ?? null,
            },
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
      value: (heritageProps.amodiataires.actif ? (isNotNullNorUndefined(heritageProps.amodiataires.etape) ? heritageProps.amodiataires.etape.amodiataireIds : []) : titreEtape.amodiataireIds) ?? [],

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

  // On flatten ici pour enlever les champs supplémentaires qu'il y'a par exemple dans perimetre
  return flattenEtapeValidator.parse(flattenEtape)
}
export const titreEtapeFormat = (titreEtape: ITitreEtape, fields = titreEtapeFormatFields) => {
  if (titreEtape.demarche) {
    titreEtape.demarche = titreDemarcheFormat(titreEtape.demarche, fields.demarche)
  }

  return titreEtape
}
