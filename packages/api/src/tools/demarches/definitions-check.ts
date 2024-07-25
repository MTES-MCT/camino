import { demarchesDefinitions } from '../../business/rules-demarches/definitions'
import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { titreDemarcheUpdatedEtatValidate } from '../../business/validations/titre-demarche-etat-validate'
import { userSuper } from '../../database/user-super'
import { getTitreTypeType, getDomaineId } from 'camino-common/src/static/titresTypes'
import { onlyUnique } from 'camino-common/src/typescript-tools'

const demarchesValidate = async () => {
  const errors = [] as string[]
  for (const demarcheDefinition of demarchesDefinitions) {
    for (const demarcheTypeId of demarcheDefinition.demarcheTypeIds) {
      const demarches = await titresDemarchesGet(
        {
          titresTypesIds: demarcheDefinition.titreTypeIds.map(getTitreTypeType).filter(onlyUnique),
          titresDomainesIds: demarcheDefinition.titreTypeIds.map(getDomaineId).filter(onlyUnique),
          typesIds: [demarcheTypeId],
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
        .filter(demarche => demarche.etapes?.length)
        .forEach(demarche => {
          try {
            const errs = titreDemarcheUpdatedEtatValidate(demarche.typeId, demarche.titre!, demarche.etapes![0], demarche.id, demarche.etapes!)

            if (errs.length) {
              errors.push(`https://camino.beta.gouv.fr/titres/${demarche.titreId} => démarche "${demarche.typeId}" : ${errs}`)
            }
          } catch (e) {
            errors.push(`${demarche.id} démarche invalide =>\n\t${e}`)
          }
        })
    }
  }

  return errors
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
