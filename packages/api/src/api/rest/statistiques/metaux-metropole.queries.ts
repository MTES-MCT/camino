import { sql } from '@pgtyped/runtime'
import { AnneeCountStatistique } from 'camino-common/src/statistiques.js'
import { Redefine } from '../../../pg-database.js'
import { IGetSelByAnneeByCommuneQuery, IGetSubstancesByEntrepriseCategoryByAnneeQuery, IGetTitreActiviteSubstanceParAnneeQuery } from './metaux-metropole.queries.types.js'
import { SubstanceFiscaleId } from 'camino-common/src/static/substancesFiscales.js'
import { z } from 'zod'
import { caminoAnneeValidator } from 'camino-common/src/date.js'
import { codePostalValidator } from 'camino-common/src/static/departement.js'

export const getTitreActiviteSubstanceParAnnee = sql<Redefine<IGetTitreActiviteSubstanceParAnneeQuery, { substanceFiscale: SubstanceFiscaleId }, AnneeCountStatistique>>`
select
    annee,
    titres_activites.contenu -> 'substancesFiscales' -> $ substanceFiscale as count
from
    titres_activites
where
    titres_activites.contenu -> 'substancesFiscales' ? $ substanceFiscale
`

export const selByAnneeByCommuneValidator = z.object({
  annee: caminoAnneeValidator,
  commune_id: codePostalValidator,
  nacc: z.number(),
  naca: z.number(),
  nacb: z.number(),
})

type SelByAnneeByCommune = z.infer<typeof selByAnneeByCommuneValidator>
export const getSelByAnneeByCommune = sql<Redefine<IGetSelByAnneeByCommuneQuery, void, SelByAnneeByCommune>>`
select distinct on ("titres"."slug", "titres_activites"."annee")
    "titres_activites"."annee",
    "tc"."commune_id",
    titres_activites.contenu -> 'substancesFiscales' -> 'nacc' as nacc,
    titres_activites.contenu -> 'substancesFiscales' -> 'naca' as naca,
    titres_activites.contenu -> 'substancesFiscales' -> 'nacb' as nacb
from
    "titres_activites"
    left join "titres" on "titres"."id" = "titres_activites"."titre_id"
    left join titres_communes tc on tc.titre_etape_id = titres.props_titre_etapes_ids ->> 'points'
where
    titres_activites.contenu -> 'substancesFiscales' ? 'nacc'
    or titres_activites.contenu -> 'substancesFiscales' ? 'nacb'
    or titres_activites.contenu -> 'substancesFiscales' ? 'naca'
order by
    "titres"."slug" asc
`

export const substancesByEntrepriseCategoryByAnneeValidator = z.object({
  annee: caminoAnneeValidator,
  categorie: z.enum(['pme', 'autre']),
  aloh: z.coerce.number(),
  naca: z.coerce.number(),
  nacb: z.coerce.number(),
  nacc: z.coerce.number(),
})
type SubstancesByEntrepriseCategoryByAnnee = z.infer<typeof substancesByEntrepriseCategoryByAnneeValidator>
export const getSubstancesByEntrepriseCategoryByAnnee = sql<Redefine<IGetSubstancesByEntrepriseCategoryByAnneeQuery, void, SubstancesByEntrepriseCategoryByAnnee>>`
select
    case when e_t.categorie = 'PME' then
        'pme'
    else
        'autre'
    end as categorie,
    ta.annee,
    sum((ta.contenu -> 'substancesFiscales' -> 'aloh')::bigint) as aloh,
    sum((ta.contenu -> 'substancesFiscales' -> 'nacc')::bigint) as nacc,
    sum((ta.contenu -> 'substancesFiscales' -> 'nacb')::bigint) as nacb,
    sum((ta.contenu -> 'substancesFiscales' -> 'naca')::bigint) as naca
from
    titres_activites ta
    join titres t on t.id = ta.titre_id
    left join titres_titulaires tt on t.props_titre_etapes_ids ->> 'titulaires' = tt.titre_etape_id
    left join entreprises e_t on e_t.id = tt.entreprise_id
where
    ta.contenu -> 'substancesFiscales' ? 'aloh'
    or ta.contenu -> 'substancesFiscales' ? 'nacc'
    or ta.contenu -> 'substancesFiscales' ? 'nacb'
    or ta.contenu -> 'substancesFiscales' ? 'naca'
group by
    case when e_t.categorie = 'PME' then
        'pme'
    else
        'autre'
    end,
    ta.annee
`
