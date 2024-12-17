import '../../init'
import { writeFileSync } from 'fs'

import { knex } from '../../knex'
import { TitrePhasesTest } from '../../business/rules/titre-phases-find.test'
import { CaminoDate, dateAddDays, getDay } from 'camino-common/src/date'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { ETAPES_TYPES, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheId } from 'camino-common/src/demarche'
import { newDemarcheId, newTitreId } from '../../database/models/_format/id-create'
import { DATE_PAR_DEFAUT_TITRE_INFINI, TitreDemarchePhaseFind, TitreEtapePhaseFind } from '../../business/rules/titre-phases-find'
import { TitreId } from 'camino-common/src/validators/titres'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { EtapeBrouillon } from 'camino-common/src/etape'
import { KM2 } from 'camino-common/src/number'
import { CommuneId } from 'camino-common/src/static/communes'
import { isDemarcheIdException } from 'camino-common/src/machines'

const writePhasesForTest = async () => {
  const demarches: {
    rows: {
      id: DemarcheId
      titre_id: TitreId
      ordre: number
      statut_id: DemarcheStatutId
      demarche_type_id: DemarcheTypeId
      titre_type_id: TitreTypeId
      demarche_date_debut: CaminoDate | null
      demarche_date_fin: CaminoDate | null
    }[]
  } = await knex.raw(`select td.id, td.ordre, td.statut_id, td.type_id as demarche_type_id, t.type_id  as titre_type_id, t.id as titre_id, td.demarche_date_debut, td.demarche_date_fin
    from titres_demarches td
        join titres t on td.titre_id = t.id
        -- on exclue les titres dont les dates de fin correspondent à DATE_PAR_DEFAUT_TITRE_INFINI (ça fout la grouille dans l'algo d'anonymisation)
        where td.archive is false AND t.id NOT IN ('THoP5S2Jl8rXLrl5uWrggvwh', 'hnJ0sjJj9IBsg4Oi3Q8xY7Kc', 'kkwAN6lDgDK0f1UJIEuiXiVa', '8XKBSW0IFg4EF4yOkF0YMhjk')`)

  const etapesDb: {
    rows: {
      titre_demarche_id: DemarcheId
      ordre: number
      etape_type_id: EtapeTypeId
      date_fin: CaminoDate | null
      date_debut: CaminoDate | null
      date: CaminoDate
      duree: number | null
      statut_id: EtapeStatutId
      contenu: unknown
      is_brouillon: EtapeBrouillon
      geojson4326_perimetre: NonNullable<unknown> | null
      demarche_ids_consentement: DemarcheId[]
      surface: KM2
      communes: { id: CommuneId; surface: number }[]
    }[]
  } =
    await knex.raw(`select json_build_object('arm', json_build_object('mecanise', contenu -> 'arm' -> 'mecanise', 'franchissements', contenu -> 'arm' -> 'franchissements')) as contenu, te.titre_demarche_id, te.ordre, te.type_id as etape_type_id, te.date_fin, te.date_debut, te.date, te.duree, te.statut_id, te.geojson4326_perimetre, te.is_brouillon, te.demarche_ids_consentement, te.surface, te.communes from titres_etapes te
    where te.archive is false
    group by te.id`)

  const titres = demarches.rows.reduce<{
    [id: string]: {
      titreTypeId: TitreTypeId
      demarches: TitreDemarchePhaseFind[]
    }
  }>((acc, row) => {
    if (isNullOrUndefined(acc[row.titre_id])) {
      acc[row.titre_id] = {
        titreTypeId: row.titre_type_id,
        demarches: [],
      }
    }

    const etapes: TitreEtapePhaseFind[] = etapesDb.rows
      .filter(({ titre_demarche_id }) => titre_demarche_id === row.id)
      .map(etapeDb => ({
        titreDemarcheId: etapeDb.titre_demarche_id,
        ordre: etapeDb.ordre,
        typeId: etapeDb.etape_type_id,
        dateFin: etapeDb.date_fin,
        duree: etapeDb.duree,
        dateDebut: etapeDb.date_debut,
        date: etapeDb.date,
        statutId: etapeDb.statut_id,
        contenu: etapeDb.contenu,
        isBrouillon: etapeDb.is_brouillon,
        geojson4326Perimetre: isNotNullNorUndefined(etapeDb.geojson4326_perimetre)
          ? {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'MultiPolygon',
                coordinates: [
                  [
                    [
                      [1, 2],
                      [1, 2],
                      [1, 2],
                      [1, 2],
                    ],
                  ],
                ],
              },
            }
          : null,
        demarcheIdsConsentement: etapeDb.demarche_ids_consentement,

        // pour la concurrence
        ...(etapeDb.etape_type_id === ETAPES_TYPES.demande
          ? {
              hasTitreFrom: false,
              concurrence: {
                amIFirst: true,
              },
              surface: etapeDb.surface,
              communes: etapeDb.communes,
            }
          : {}),
        ...(etapeDb.etape_type_id === ETAPES_TYPES.recevabiliteDeLaDemande
          ? {
              hasTitreFrom: false,
            }
          : {}),
      }))

    acc[row.titre_id].demarches.push({
      titreId: row.titre_id,
      statutId: row.statut_id,
      ordre: row.ordre,
      typeId: row.demarche_type_id,
      id: row.id,
      demarcheDateDebut: row.demarche_date_debut,
      demarcheDateFin: row.demarche_date_fin,
      etapes,
    })

    return acc
  }, {})

  const result: TitrePhasesTest[] = Object.keys(titres)
    .filter(titreId => !titres[titreId].demarches.some(({ id }) => isDemarcheIdException(id)))
    .map(titreId => {
      const titre = titres[titreId]
      const demarches = titre.demarches.toSorted((a, b) => (a.ordre ?? Infinity) - (b.ordre ?? Infinity))

      const shouldRemoveDays = demarches.some(demarche => isNotNullNorUndefined(demarche.demarcheDateFin) && getDay(demarche.demarcheDateFin) >= 28)

      const daysToChange = (shouldRemoveDays ? -1 : 1) * Math.round(Math.random() * 2)

      const fakeDemarcheId = `fakeDemarcheId-${newDemarcheId()}` as DemarcheId
      const fakeTitreId = `fakeTitreId-${newTitreId()}` as TitreId
      return [
        titre.titreTypeId,
        demarches.map<TitreDemarchePhaseFind>(demarche => ({
          ...demarche,
          titreId: fakeTitreId,
          id: fakeDemarcheId,
          etapes: demarche.etapes?.map(etapeDb => ({
            ...etapeDb,
            titreDemarcheId: fakeDemarcheId,
            date: dateAddDays(etapeDb.date, daysToChange),
            dateFin: isNotNullNorUndefined(etapeDb.dateFin) ? (etapeDb.dateFin === DATE_PAR_DEFAUT_TITRE_INFINI ? etapeDb.dateFin : dateAddDays(etapeDb.dateFin, daysToChange)) : null,
            dateDebut: isNotNullNorUndefined(etapeDb.dateDebut) ? dateAddDays(etapeDb.dateDebut, daysToChange) : null,
          })),
          demarcheDateDebut: isNotNullNorUndefined(demarche.demarcheDateDebut)
            ? demarche.demarcheDateDebut === DATE_PAR_DEFAUT_TITRE_INFINI
              ? demarche.demarcheDateDebut
              : dateAddDays(demarche.demarcheDateDebut, daysToChange)
            : null,
          demarcheDateFin: isNotNullNorUndefined(demarche.demarcheDateFin)
            ? demarche.demarcheDateFin === DATE_PAR_DEFAUT_TITRE_INFINI
              ? demarche.demarcheDateFin
              : dateAddDays(demarche.demarcheDateFin, daysToChange)
            : null,
        })),
      ]
    })

  writeFileSync(`src/business/rules/titre-phases-find.cas.json`, JSON.stringify(result))
}

writePhasesForTest()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
