import { demarchesDefinitions } from '../../business/rules-demarches/definitions'
import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { titreDemarcheUpdatedEtatValidate } from '../../business/validations/titre-demarche-etat-validate'
import { userSuper } from '../../database/user-super'
import { getTitreTypeType, getDomaineId } from 'camino-common/src/static/titresTypes'
import { isNotNullNorUndefinedNorEmpty, onlyUnique } from 'camino-common/src/typescript-tools'

const demarchesValidate = async () => {
  const errorsTotal = [] as string[]
  for (const demarcheDefinition of demarchesDefinitions) {
    for (const demarcheTypeId of demarcheDefinition.demarcheTypeIds) {
      const demarches = await titresDemarchesGet(
        {
          titresTypesIds: demarcheDefinition.titreTypeIds.map(getTitreTypeType).filter(onlyUnique),
          titresDomainesIds: demarcheDefinition.titreTypeIds.map(getDomaineId).filter(onlyUnique),
          typesIds: [demarcheTypeId],

          // titresDemarchesIds: ['DGxGTYlnDDGamQtreDOhFlLl'],
        },
        {
          fields: {
            titre: { id: {}, demarches: { etapes: { id: {} } } },
            etapes: { id: {} },
          },
        },
        userSuper
      )

      demarches
        .filter(demarche => isNotNullNorUndefinedNorEmpty(demarche.etapes))
        .forEach(demarche => {
          try {
            const { valid, errors } = titreDemarcheUpdatedEtatValidate(demarche.typeId, demarche.titre!, demarche.etapes![0], demarche.id, demarche.etapes!)

            if (!valid) {
              errorsTotal.push(`https://camino.beta.gouv.fr/demarches/${demarche.slug} => démarche "${demarche.typeId}" : ${errors}`)
            }
          } catch (e) {
            errorsTotal.push(`${demarche.id} démarche invalide =>\n\t${e}`)
          }
        })
    }
  }

  return errorsTotal
}

export const demarchesDefinitionsCheck = async (): Promise<void> => {
  console.info()
  console.info('- - -')
  console.info('vérification des démarches')
  console.info()

  let errorsNb = 0
  const demarchesErrors = await demarchesValidate()
  demarchesErrors.forEach(e => {
    errorsNb++
    console.error(e)
  })

  console.info(`erreurs : ${errorsNb}`)
}
