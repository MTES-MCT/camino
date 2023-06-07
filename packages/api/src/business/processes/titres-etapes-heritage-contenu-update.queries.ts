import { sql } from '@pgtyped/runtime'
import { IGetEtapesByDemarcheQuery } from './titres-etapes-heritage-contenu-update.queries.types'
import { Redefine } from '../../pg-database'
import { caminoDateValidator } from 'camino-common/src/date.js'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche.js'
import { demarcheStatutIdValidator } from 'camino-common/src/static/demarchesStatuts.js'
import { demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes.js'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts.js'
import { titreTypeIdValidator } from 'camino-common/src/static/titresTypes.js'
import { etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes.js'
import { TitreId, titreIdValidator } from 'camino-common/src/titres.js'
import { etapeIdValidator } from 'camino-common/src/etape.js'
import { z } from 'zod'
import { communeIdValidator } from 'camino-common/src/static/communes.js'

export const getEtapesByDemarcheValidator = z.object({
  contenu: z.any(),
  date: caminoDateValidator,
  demarche_id: demarcheIdValidator,
  demarche_statut_id: demarcheStatutIdValidator,
  demarche_type_id: demarcheTypeIdValidator,
  heritage_contenu: z.any(),
  id: etapeIdValidator,
  ordre: z.number(),
  statut_id: etapeStatutIdValidator,
  titre_id: titreIdValidator,
  titre_type_id: titreTypeIdValidator,
  communes: z.array(z.object({ id: communeIdValidator })),
  type_id: etapeTypeIdValidator,
})

export const getEtapesByDemarche = sql<Redefine<IGetEtapesByDemarcheQuery, { demarcheId?: DemarcheId; titreId?: TitreId }, z.infer<typeof getEtapesByDemarcheValidator>>>`
SELECT
    titre.id as titre_id,
    titre.type_id as titre_type_id,
    etape.id,
    etape.ordre,
    etape.type_id,
    etape.statut_id,
    etape.date,
    etape.contenu,
    etape.heritage_contenu,
    demarche.id as demarche_id,
    demarche.type_id as demarche_type_id,
    demarche.statut_id as demarche_statut_id,
    etape.communes as communes
from
    titres_etapes etape
    join titres_demarches demarche on etape.titre_demarche_id = demarche.id
    join titres titre on demarche.titre_id = titre.id
where
    etape.archive = false
    and demarche.archive = false
    and titre.archive = false
    and ($ demarcheId::text IS NULL
        or demarche.id = $ demarcheId)
    and ($ titreId::text IS NULL
        or titre.id = $ titreId)
order by
    demarche.id,
    etape.ordre
`
