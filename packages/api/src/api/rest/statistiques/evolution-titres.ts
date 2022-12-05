import { CaminoAnnee, toCaminoAnnee } from 'camino-common/src/date.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes.js'
import { DepartementId } from 'camino-common/src/static/departement.js'
import { DOMAINES_IDS } from 'camino-common/src/static/domaines.js'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'
import { toTitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes.js'
import { EvolutionTitres } from 'camino-common/src/statistiques.js'
import { knex } from '../../../knex.js'

export const evolutionTitres = async (
  titreTypeTypeId: TitreTypeTypeId,
  departements: DepartementId[],
  anneeDepart = 2017
): Promise<EvolutionTitres> => {
  let currentYear = new Date().getFullYear()
  const annee: Record<CaminoAnnee, number> = {}
  while (currentYear >= anneeDepart) {
    annee[toCaminoAnnee(currentYear)] = 0
    currentYear--
  }
  const demarcheOctroiTypeIds = [
    DEMARCHES_TYPES_IDS.Octroi,
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2
  ]
  const titreTypeId = toTitreTypeId(titreTypeTypeId, DOMAINES_IDS.METAUX)
  const depot: {
    rows: { annee: CaminoAnnee; count: string }[]
  } = await knex.raw(`
          select substring(et."date", 0, 5) as annee, count(t.*) from titres_etapes et 
          join titres_demarches td on td.id  = et.titre_demarche_id 
          join titres t on t.id = td.titre_id 
          where et.type_id = '${ETAPES_TYPES.depotDeLaDemande}' 
          and et.archive is false
          and td.type_id in (${toJoinSQL(demarcheOctroiTypeIds)})
          and t.type_id = '${titreTypeId}'
          and substring(et."date", 0, 5)::int >= ${anneeDepart}
          and exists (select * from titres_communes tc join communes c on c.id = tc.commune_id where tc.titre_etape_id = t.props_titre_etapes_ids ->> 'points' and c.departement_id::text in (${toJoinSQL(
            departements
          )}))
          group by substring(et."date", 0, 5)
          `)

  const octroi: {
    rows: { annee: CaminoAnnee; count: string }[]
  } = await knex.raw(`
          select substring(tp."date_debut", 0, 5) as annee, count(t.*) from titres_phases tp
          join titres_demarches td on td.id  = tp.titre_demarche_id  
              join titres t on t.id = td.titre_id 
          where td.type_id in (${toJoinSQL(demarcheOctroiTypeIds)})
          and t.type_id = '${titreTypeId}'
          and substring(tp."date_debut", 0, 5)::int >= ${anneeDepart} 
          and exists (select * from titres_communes tc join communes c on c.id = tc.commune_id where tc.titre_etape_id = t.props_titre_etapes_ids ->> 'points' and c.departement_id::text in (${toJoinSQL(
            departements
          )}))
          group by substring(tp."date_debut", 0, 5)
        `)

  const etapesTypesDecisionRefus = [
    ETAPES_TYPES.decisionImplicite,
    ETAPES_TYPES.decisionDeLadministration,
    ETAPES_TYPES.decisionDuJugeAdministratif
  ]
  const refus: {
    rows: { annee: CaminoAnnee; count: string }[]
  } = await knex.raw(`
           select substring(et."date", 0, 5) as annee, count(distinct t.id) from titres_etapes et 
           join titres_demarches td on td.id  = et.titre_demarche_id 
           join titres t on t.id = td.titre_id 
           where 
           ((et.type_id in (${toJoinSQL(
             etapesTypesDecisionRefus
           )}) and et.statut_id = '${
    ETAPES_STATUTS.REJETE
  }') or (et.type_id = '${
    ETAPES_TYPES.classementSansSuite
  }' and et.statut_id = '${ETAPES_STATUTS.FAIT}'))
           and et.archive is false
           and td.type_id in (${toJoinSQL(demarcheOctroiTypeIds)})
           and t.type_id = '${titreTypeId}'
           and td.statut_id in (${toJoinSQL([
             DemarchesStatutsIds.Rejete,
             DemarchesStatutsIds.ClasseSansSuite
           ])})
           and substring(et."date", 0, 5)::int >= ${anneeDepart}
           and exists (select * from titres_communes tc join communes c on c.id = tc.commune_id where tc.titre_etape_id = t.props_titre_etapes_ids ->> 'points' and c.departement_id::text in (${toJoinSQL(
             departements
           )}))
           group by substring(et."date", 0, 5)
  `)

  // conversion 1 km² = 100 ha
  const surface: {
    rows: { annee: CaminoAnnee; count: string }[]
  } = await knex.raw(`
      select substring(et."date", 0, 5) as annee, sum(t_surface.surface * 100) as count from titres_etapes et 
      join titres_demarches td on td.id  = et.titre_demarche_id 
      join titres t on t.id = td.titre_id 
      join titres_etapes t_surface on t_surface.id =  t.props_titre_etapes_ids ->> 'surface'
      where et.type_id = '${ETAPES_TYPES.depotDeLaDemande}' 
      and et.archive is false
      and td.type_id in (${toJoinSQL(demarcheOctroiTypeIds)})
      and t.type_id = '${titreTypeId}'
      and substring(et."date", 0, 5)::int >= ${anneeDepart}
      and exists (select * from titres_communes tc join communes c on c.id = tc.commune_id where tc.titre_etape_id = t.props_titre_etapes_ids ->> 'points' and c.departement_id::text in (${toJoinSQL(
        departements
      )}))
      group by substring(et."date", 0, 5)
      `)

  return {
    depot: { ...annee, ...toRecord(depot.rows) },
    octroiEtProlongation: { ...annee, ...toRecord(octroi.rows) },
    refusees: { ...annee, ...toRecord(refus.rows) },
    surface: { ...annee, ...toRecord(surface.rows) }
  }
}

const toJoinSQL = (values: any[]): string => {
  return values.map(v => `'${v}'`).join(',')
}

const toRecord = (
  values: { annee: CaminoAnnee; count: string }[]
): Record<CaminoAnnee, number> => {
  return values.reduce<Record<CaminoAnnee, number>>((acc, { annee, count }) => {
    acc[annee] = Number(count)

    return acc
  }, {})
}
