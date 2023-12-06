/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { Redefine } from '../../pg-database.js'
import { IGetEtapesByDemarcheIdDbQuery } from './demarches.queries.types.js'
import { z } from 'zod'
import { caminoDateValidator } from 'camino-common/src/date.js'
import { communeValidator } from 'camino-common/src/static/communes.js'
import { secteurMaritimeValidator } from 'camino-common/src/static/facades.js'
import { substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales.js'
import { etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes.js'
import { etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape.js'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts.js'
import { contenuValidator } from './activites.queries.js'
import { sectionValidator } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { sdomZoneIdValidator } from 'camino-common/src/static/sdom.js'
import { foretIdValidator } from 'camino-common/src/static/forets.js'

export const getEtapesByDemarcheIdDbValidator = z.object({
  id: etapeIdValidator,
  slug: etapeSlugValidator,
  date: caminoDateValidator,
  communes: z.array(communeValidator.pick({ id: true })),
  secteurs_maritime: z.array(secteurMaritimeValidator).nullable(),
  substances: z.array(substanceLegaleIdValidator).nullable(),
  etape_type_id: etapeTypeIdValidator,
  etape_statut_id: etapeStatutIdValidator,
  heritage_props: z.record(z.string(), z.object({ actif: z.boolean() })).nullable(),
  heritage_contenu: z.record(z.string(), z.record(z.string(), z.object({ actif: z.boolean() }))).nullable(),
  date_debut: caminoDateValidator.nullable(),
  date_fin: caminoDateValidator.nullable(),
  duree: z.number().nullable(),
  surface: z.number().nullable(),
  contenu: contenuValidator.nullable(),
  sdom_zones: z.array(sdomZoneIdValidator).nullable(),
  forets: z.array(foretIdValidator).nullable(),
  decisions_annexes_contenu: contenuValidator.nullable(),
  decisions_annexes_sections: z.array(sectionValidator).nullable(),
})
type GetEtapesByDemarcheIdDb = z.infer<typeof getEtapesByDemarcheIdDbValidator>
export const getEtapesByDemarcheIdDb = sql<Redefine<IGetEtapesByDemarcheIdDbQuery, { demarcheId: DemarcheId }, GetEtapesByDemarcheIdDb>>`
select
    e.id,
    e.date,
    e.communes,
    e.secteurs_maritime,
    e.substances,
    e.type_id as etape_type_id,
    e.statut_id as etape_statut_id,
    e.heritage_props,
    e.heritage_contenu,
    e.date_debut,
    e.date_fin,
    e.duree,
    e.surface,
    e.contenu,
    e.slug,
    e.sdom_zones,
    e.forets,
    e.decisions_annexes_contenu,
    e.decisions_annexes_sections
from
    titres_etapes e
where
    e.titre_demarche_id = $ demarcheId !
    and e.archive is false
order by
    date desc
`
