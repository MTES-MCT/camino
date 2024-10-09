import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { titreDemarcheUpdatedEtatValidate } from '../../business/validations/titre-demarche-etat-validate'
import { userSuper } from '../../database/user-super'
import { getTitreTypeType, getDomaineId } from 'camino-common/src/static/titresTypes'
import { isNotNullNorUndefinedNorEmpty, onlyUnique } from 'camino-common/src/typescript-tools'
import { DemarcheId } from 'camino-common/src/demarche'
import { demarchesDefinitions } from 'camino-common/src/machines'

const demarchesValidate = async () => {
  const demarchesIdsAlreadyChecked: Set<DemarcheId> = new Set()
  const errorsTotal = [] as string[]
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
            titre: { id: {}, demarches: { id: {} } },
            etapes: { id: {} },
          },
        },
        userSuper
      )
      for (const demarche of demarches) {
        if (!demarchesIdsAlreadyChecked.has(demarche.id)) {
          demarchesIdsAlreadyChecked.add(demarche.id)

          if (isNotNullNorUndefinedNorEmpty(demarche.etapes)) {
            try {
              const sortedEtapes = demarche.etapes!.toSorted((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
              const { valid, errors } = titreDemarcheUpdatedEtatValidate(demarche.typeId, demarche.titre!, sortedEtapes![0], demarche.id, sortedEtapes!)

              if (!valid) {
                errorsTotal.push(`https://camino.beta.gouv.fr/demarches/${demarche.slug} => démarche "${demarche.typeId}" : ${errors}`)
              }
            } catch (e) {
              errorsTotal.push(`${demarche.id} démarche invalide =>\n\t${e}`)
            }
          }
        }
      }
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
