import {
  demarchesDefinitions,
  IDemarcheDefinition,
  IEtapeTypeIdCondition,
  isDemarcheDefinitionRestriction,
  DemarcheDefinitionRestriction
} from '../../business/rules-demarches/definitions'
import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { titreDemarcheUpdatedEtatValidate } from '../../business/validations/titre-demarche-etat-validate'
import { userSuper } from '../../database/user-super'
import TitresTypesDemarchesTypesEtapesTypes from '../../database/models/titres-types--demarches-types-etapes-types'

const etapeTypeIdsGet = (contraintes?: IEtapeTypeIdCondition[][]) => {
  const etapeTypeIds = [] as string[]
  if (contraintes?.length) {
    contraintes.forEach(contrainte => {
      contrainte.forEach(c => {
        if (c.etapeTypeId) {
          etapeTypeIds.push(c.etapeTypeId)
        }
      })
    })
  }

  return etapeTypeIds
}

const etapesTypesIdsGet = async (titreTypeId: string, demarcheTypeId: string) =>
  (
    await TitresTypesDemarchesTypesEtapesTypes.query()
      .withGraphFetched('etapeType')
      .where('titreTypeId', titreTypeId)
      .andWhere('demarcheTypeId', demarcheTypeId)
  )
    .map(tde => tde.etapeType!)
    .filter(etapeType => !etapeType.dateFin || etapeType.dateFin === '')
    .map(etapeType => etapeType.id)

const tdeValidate = async () => {
  const errors = [] as string[]

  const definitionsWithRestrictions = demarchesDefinitions.filter(
    (
      demarcheDefinition: IDemarcheDefinition
    ): demarcheDefinition is DemarcheDefinitionRestriction =>
      isDemarcheDefinitionRestriction(demarcheDefinition)
  )

  for (const demarcheDefinition of definitionsWithRestrictions) {
    for (const demarcheTypeId of demarcheDefinition.demarcheTypeIds) {
      const demarcheEtatsEtapeTypeIds = Object.keys(
        demarcheDefinition.restrictions
      )
        .reduce((acc, etapeTypeId) => {
          acc.push(etapeTypeId)
          const restriction = demarcheDefinition.restrictions[etapeTypeId]
          if (restriction.separation) {
            acc.push(...restriction.separation)
          }
          acc.push(...etapeTypeIdsGet(restriction.avant))
          acc.push(...etapeTypeIdsGet(restriction.apres))
          acc.push(...etapeTypeIdsGet(restriction.justeApres))

          return acc
        }, [] as string[])
        .map(type => type.split('-')[0])

      const tdeEtapeTypeIds = await etapesTypesIdsGet(
        demarcheDefinition.titreTypeId,
        demarcheTypeId
      )

      // on v??rifie que toutes les ??tapes d??finies dans l???arbre existent dans TDE
      demarcheEtatsEtapeTypeIds.forEach(demarcheEtatsEtapeTypeId => {
        if (!tdeEtapeTypeIds.includes(demarcheEtatsEtapeTypeId)) {
          errors.push(
            `titre "${demarcheDefinition.titreTypeId}" d??marche "${demarcheTypeId}" ??tape "${demarcheEtatsEtapeTypeId}" pr??sent dans l???arbre d???instructions mais pas dans TDE`
          )
        }
      })

      // on v??rifie que toutes les ??tapes d??finies dans TDE existent dans l???arbre
      tdeEtapeTypeIds.forEach(tdeEtapeTypeId => {
        if (!demarcheEtatsEtapeTypeIds.includes(tdeEtapeTypeId)) {
          errors.push(
            `titre "${demarcheDefinition.titreTypeId}" d??marche "${demarcheTypeId}" ??tape "${tdeEtapeTypeId}" pr??sent dans TDE mais pas dans l???arbre d???instructions`
          )
        }
      })
    }
  }

  // on v??rifie qu???il existe un bloc dans l???arbre par ??tapes d??finies dans TDE
  for (const demarcheDefinition of definitionsWithRestrictions) {
    for (const demarcheTypeId of demarcheDefinition.demarcheTypeIds) {
      const demarcheEtatsEtapeTypeIds = Object.keys(
        demarcheDefinition.restrictions
      )

      const tdeEtapeTypeIds = await etapesTypesIdsGet(
        demarcheDefinition.titreTypeId,
        demarcheTypeId
      )

      tdeEtapeTypeIds.forEach(tdeEtapeTypeId => {
        if (!demarcheEtatsEtapeTypeIds.includes(tdeEtapeTypeId)) {
          errors.push(
            `bloc manquant "${tdeEtapeTypeId}" dans l???arbre des d??marches "${demarcheTypeId}" des titres "${demarcheDefinition.titreTypeId}"`
          )
        }
      })
    }
  }

  return errors
}

const demarchesValidate = async () => {
  const errors = [] as string[]
  for (const demarcheDefinition of demarchesDefinitions) {
    for (const demarcheTypeId of demarcheDefinition.demarcheTypeIds) {
      const demarches = await titresDemarchesGet(
        {
          titresTypesIds: [demarcheDefinition.titreTypeId.slice(0, 2)],
          titresDomainesIds: [demarcheDefinition.titreTypeId.slice(2)],
          typesIds: [demarcheTypeId]
        },
        {
          fields: {
            titre: { id: {}, demarches: { etapes: { id: {} } } },
            etapes: { id: {} },
            type: { etapesTypes: { etapesStatuts: { id: {} } } }
          }
        },
        userSuper
      )

      demarches
        .filter(demarche => demarche.etapes?.length)
        .forEach(demarche => {
          try {
            const errs = titreDemarcheUpdatedEtatValidate(
              demarche.type!,
              demarche.titre!,
              demarche.etapes![0],
              demarche.etapes!
            )

            if (errs.length) {
              errors.push(
                `https://camino.beta.gouv.fr/titres/${demarche.titreId} => d??marche "${demarche.typeId}" : ${errs}`
              )

              // console.info(
              //   '[',
              //   demarche
              //     .etapes!.map(
              //       e =>
              //         `{ typeId: '${e.typeId}', statutId: '${e.statutId}', date: '${e.date}' }`
              //     )
              //     .join(','),
              //   ']'
              // )
            }
          } catch (e) {
            errors.push(`${demarche.id} d??marche invalide =>\n\t${e}`)
          }
        })
    }
  }

  return errors
}

const demarchesDefinitionsCheck = async () => {
  console.info()
  console.info('- - -')
  console.info('v??rification des d??marches')
  console.info()

  let errorsNb = 0
  const tdeErrors = await tdeValidate()
  tdeErrors.forEach(e => {
    errorsNb++
    console.error(e)
  })

  const demarchesErrors = await demarchesValidate()
  demarchesErrors.forEach(e => {
    errorsNb++
    console.error(e)
  })

  console.info(`erreurs : ${errorsNb}`)
}

export default demarchesDefinitionsCheck
