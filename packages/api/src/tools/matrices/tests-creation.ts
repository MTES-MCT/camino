import '../../init'
import { writeFileSync } from 'fs'

import { anneePrecedente, caminoAnneeToNumber, caminoAnneeValidator, toCaminoAnnee } from 'camino-common/src/date'
import { bodyBuilder } from '../../api/rest/entreprises'
import { apiOpenfiscaCalculate, apiOpenfiscaConstantsFetch } from '../api-openfisca'
import { titresGet } from '../../database/queries/titres'
import { titresActivitesGet } from '../../database/queries/titres-activites'
import { userSuper } from '../../database/user-super'
import { REGION_IDS } from 'camino-common/src/static/region'
import { GetEntreprises, getEntreprises } from '../../api/rest/entreprises.queries'
import { config } from '../../config'
import pg from 'pg'
import { z } from 'zod'
import { TitreId, titreIdValidator } from 'camino-common/src/validators/titres'
import { EntrepriseId, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales'
import { CommuneId, communeIdValidator } from 'camino-common/src/static/communes'
import { idGenerate, newTitreId } from '../../database/models/_format/id-create'
import { BuildedMatrices, buildMatrices } from '../../business/matrices'
// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: config().PGHOST,
  user: config().PGUSER,
  password: config().PGPASSWORD,
  database: config().PGDATABASE,
})

const titreIdsIndex: Record<TitreId, TitreId> = {}

const titreIdTransformer = titreIdValidator.transform((value: TitreId): TitreId => {
  if (titreIdsIndex[value] === undefined) {
    const newId = newTitreId()
    titreIdsIndex[value] = newId
  }

  return titreIdsIndex[value]
})

const entrepriseIdsIndex: Record<EntrepriseId, EntrepriseId> = {}
const communeIdsIndex: Record<CommuneId, CommuneId> = {}

const entrepriseIdTransformer = entrepriseIdValidator.transform((value: EntrepriseId): EntrepriseId => {
  if (entrepriseIdsIndex[value] === undefined) {
    const newId = idGenerate(8) as EntrepriseId
    entrepriseIdsIndex[value] = newId
  }

  return entrepriseIdsIndex[value]
})
const contenuStripedValidator = z.object({
  substancesFiscales: z.any().optional(),
  renseignements: z
    .object({
      environnement: z.any(),
    })
    .optional(),
})
const entryValidator = z.object({
  activitesAnnuelles: z.array(
    z.object({
      titreId: titreIdTransformer,
      contenu: contenuStripedValidator,
    })
  ),
  activitesTrimestrielles: z.array(
    z.object({
      titreId: titreIdTransformer,
      contenu: contenuStripedValidator,
    })
  ),
  titres: z.array(
    z.object({
      titulaireIds: z.array(entrepriseIdTransformer),
      amodiataireIds: z.array(entrepriseIdTransformer),
      substances: z.array(substanceLegaleIdValidator),
      communes: z.array(
        z.object({
          id: communeIdValidator.transform(id => {
            if (communeIdsIndex[id] === undefined) {
              const newId = `973${idGenerate(2)}` as CommuneId
              communeIdsIndex[id] = newId
            }

            return communeIdsIndex[id]
          }),
          surface: z.number(),
        })
      ),
      id: titreIdTransformer,
    })
  ),
  annee: caminoAnneeValidator,
  entreprises: z.array(z.object({ id: entrepriseIdTransformer, categorie: z.string().nullable(), nom: z.string().transform(() => '') })),
})

export type BodyMatrice = {
  entries: z.infer<typeof entryValidator>
  expected: BuildedMatrices
}
const writeMatricesForTest = async () => {
  const user = userSuper
  const testBody: BodyMatrice[] = []
  const entreprises = await getEntreprises(pool)

  const annees = [toCaminoAnnee(2023), toCaminoAnnee(2022)] as const
  for (const annee of annees) {
    const anneeMoins1 = anneePrecedente(annee)

    const titres = await titresGet(
      { regions: [REGION_IDS.Guyane] },
      {
        fields: {
          titulairesEtape: { id: {} },
          amodiatairesEtape: { id: {} },
          substancesEtape: { id: {} },
          pointsEtape: { id: {} },
        },
      },
      user
    )

    const activites = await titresActivitesGet(
      {
        typesIds: ['grx', 'gra', 'wrp'],
        statutsIds: ['dep'],
        annees: [anneeMoins1],
        titresIds: titres.map(({ id }) => id),
      },
      { fields: { id: {} } },
      user
    )
    const activitesTrimestrielles = await titresActivitesGet(
      {
        typesIds: ['grp'],
        statutsIds: ['dep'],
        annees: [anneeMoins1],
        titresIds: titres.map(({ id }) => id),
      },
      { fields: { id: {} } },
      user
    )
    const anneeNumber = caminoAnneeToNumber(annee)

    const stripedData = entryValidator.parse({
      activitesAnnuelles: activites,
      activitesTrimestrielles,
      titres,
      annee,
      entreprises,
    })

    const body = bodyBuilder(stripedData.activitesAnnuelles, stripedData.activitesTrimestrielles, stripedData.titres, anneeNumber, stripedData.entreprises)
    if (Object.keys(body.articles).length > 0) {
      const result = await apiOpenfiscaCalculate(body)
      const constants = await apiOpenfiscaConstantsFetch(anneeNumber)

      const matrices = buildMatrices(
        result,
        stripedData.titres,
        anneeNumber,
        constants,
        Object.values(communeIdsIndex).map(communeId => ({ id: communeId, nom: communeId })),
        stripedData.entreprises.reduce(
          (acc, e) => {
            acc[e.id] = { ...e, legal_siren: '', adresse: '', code_postal: '', commune: '' }

            return acc
          },
          {} as Record<EntrepriseId, Pick<GetEntreprises, 'nom' | 'adresse' | 'code_postal' | 'commune' | 'legal_siren'>>
        )
      )

      testBody.push({
        entries: stripedData,
        expected: matrices,
      })
    }
  }
  writeFileSync(`src/business/matrices.cas.json`, JSON.stringify(testBody))
}

writeMatricesForTest()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
