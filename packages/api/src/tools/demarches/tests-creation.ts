import '../../init'

import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { userSuper } from '../../database/user-super'
import { mkdirSync, writeFileSync } from 'fs'
import { Etape, titreEtapeForMachineValidator, toMachineEtapes } from '../../business/rules-demarches/machine-common'
import { machineFind, demarchesDefinitions } from '../../business/rules-demarches/definitions'
import { dateAddDays, daysBetween, setDayInMonth } from 'camino-common/src/date'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { toCommuneId } from 'camino-common/src/static/communes'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty, onlyUnique } from 'camino-common/src/typescript-tools'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes'

const writeEtapesForTest = async () => {
  for (const demarcheDefinition of demarchesDefinitions) {
    const demarches = await titresDemarchesGet(
      {
        titresTypesIds: demarcheDefinition.titreTypeIds.map(getTitreTypeType).filter(onlyUnique),
        titresDomainesIds: demarcheDefinition.titreTypeIds.map(getDomaineId).filter(onlyUnique),
        typesIds: demarcheDefinition.demarcheTypeIds,
      },
      {
        fields: {
          titre: { id: {}, demarches: { etapes: { id: {} } } },
          etapes: { id: {} },
        },
      },
      userSuper
    )

    const toutesLesEtapes = demarches
      .filter(demarche => demarche.etapes?.length)
      .filter(demarche => isNotNullNorUndefined(machineFind(demarche.titre!.typeId, demarche.typeId, demarche.etapes!, demarche.id)))
      .map((demarche, index) => {
        const etapes: Etape[] = toMachineEtapes(
          (
            demarche?.etapes
              ?.toSorted((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
              ?.map(etape => {
                if (etape?.contenu?.arm) {
                  etape.contenu = { arm: etape.contenu?.arm }
                } else {
                  delete etape.contenu
                }

                if (isNotNullNorUndefinedNorEmpty(etape.communes)) {
                  etape.communes = etape.communes.map(({ id }) => ({ nom: '', id: toCommuneId(`${id.startsWith('97') ? `${id.substring(0, 3)}00` : `${id.substring(0, 2)}000`}}`) }))
                }

                return etape
              }) ?? []
          ).map(etape => titreEtapeForMachineValidator.parse(etape))
        )
        if (isNullOrUndefinedOrEmpty(etapes)) {
          return null
        }
        // Pour anonymiser la date en gardant les délai en mois entre les 'avis des services et commissions consultatives' et l'apd,
        // on trouve la date et on calcule un delta random pour tomber dans le même mois
        const firstSaisineDate = etapes.find(etape => etape.etapeTypeId === ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives)?.date ?? etapes[0].date
        const decalageJour = daysBetween(firstSaisineDate, setDayInMonth(firstSaisineDate, Math.floor(Math.random() * 28)))
        try {
          const machine = demarcheDefinition.machine(demarche.titre!.typeId, demarche.typeId)
          if (!machine.isEtapesOk(etapes)) {
            etapes.splice(0, etapes.length, ...machine.orderMachine(etapes))
            if (!machine.isEtapesOk(etapes)) {
              console.warn(`https://camino.beta.gouv.fr/titres/${demarche.titreId} => démarche N*${index} (${demarche.id}) "${demarcheDefinition.titreTypeIds.join(' ou ')}/${demarche.typeId}"`)
            }
          }
        } catch (e) {
          console.error('something went wrong', e)
          console.error(`https://camino.beta.gouv.fr/titres/${demarche.titreId} => démarche N*${index} (${demarche.id}) "${demarcheDefinition.titreTypeIds.join(' ou ')}/${demarche.typeId}"`)
        }

        const etapesAnonymes = etapes.map(etape => {
          return { ...etape, date: dateAddDays(etape.date, decalageJour) }
        })

        return {
          id: index,
          demarcheStatutId: demarche.statutId,
          demarchePublique: demarche.publicLecture ?? false,
          etapes: etapesAnonymes,
        }
      })
      .filter(isNotNullNorUndefined)
    const filePath = `src/business/rules-demarches/${demarcheDefinition.titreTypeIds.join('-')}`
    mkdirSync(filePath, { recursive: true })
    writeFileSync(`${filePath}/${demarcheDefinition.dateDebut}-${demarcheDefinition.demarcheTypeIds.join('-')}.cas.json`, JSON.stringify(toutesLesEtapes))
  }
}

writeEtapesForTest()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
