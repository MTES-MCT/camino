import '../../init'

import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { userSuper } from '../../database/user-super'
import { writeFileSync } from 'fs'
import { Etape, titreEtapeForMachineValidator, toMachineEtapes } from '../../business/rules-demarches/machine-common'
import { dateAddDays, daysBetween, setDayInMonth } from 'camino-common/src/date'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { toCommuneId } from 'camino-common/src/static/communes'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { getDomaineId, getTitreTypeType, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { CaminoMachineId, demarchesDefinitions, machineIdFind } from 'camino-common/src/machines'
import { getMachineFromId } from '../../business/rules-demarches/machines'
import { demarcheEnregistrementDemandeDateFind, DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche'
import { DemarcheStatus, getPhase } from '../../business/rules-demarches/machine-helper'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'

export type DemarcheWithEtapeForMachinesTest = {
  id: DemarcheId
  titreTypeId: TitreTypeId
  demarcheTypeId: DemarcheTypeId
  etapes: Etape[]
  machineId: CaminoMachineId
  statut: DemarcheStatus
}
const writeEtapesForTest = async () => {
  const toutesLesEtapes: (DemarcheWithEtapeForMachinesTest | null)[] = []
  for (const demarcheDefinition of demarchesDefinitions) {
    const demarches = []
    for (const titreTypeId of demarcheDefinition.titreTypeIds) {
      demarches.push(
        ...(await titresDemarchesGet(
          {
            titresTypesIds: [getTitreTypeType(titreTypeId)],
            titresDomainesIds: [getDomaineId(titreTypeId)],
            typesIds: demarcheDefinition.demarcheTypeIds,
          },
          {
            fields: {
              titre: { id: {}, demarches: { etapes: { id: {} } } },
              etapes: { id: {} },
            },
          },
          userSuper
        ))
      )
    }

    const lesDemarchesFiltres = demarches
      .filter(demarche => isNotNullNorUndefinedNorEmpty(demarche.etapes))
      .filter(demarche => {
        const firstEtapeDate = demarcheEnregistrementDemandeDateFind(demarche.etapes)
        let machineId: CaminoMachineId | undefined
        if (isNotNullNorUndefined(firstEtapeDate)) {
          machineId = machineIdFind(demarche.titre!.typeId, demarche.typeId, demarche.id, firstEtapeDate)
        }
        return machineId === demarcheDefinition.machineId
      })
      .toSorted((a, b) => a.titreId.localeCompare(b.titreId))

    toutesLesEtapes.push(
      ...(await Promise.all(
        lesDemarchesFiltres.map(async (demarche, indexCourant) => {
          const index = indexCourant + toutesLesEtapes.length
          const etapes: Etape[] = toMachineEtapes(
            (
              demarche.etapes
                ?.toSorted((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
                .map(etape => {
                  if (etape.contenu?.arm) {
                    etape.contenu = { arm: etape.contenu.arm }
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
          let statut
          const machine = getMachineFromId({ machineId: demarcheDefinition.machineId, titreTypeId: demarche.titre!.typeId, demarcheTypeId: demarche.typeId })
          try {
            if (isNullOrUndefined(machine)) {
              console.warn('machine non trouvée')
            } else {
              if (!machine.isEtapesOk(etapes)) {
                etapes.splice(0, etapes.length, ...machine.orderMachine(etapes))
                if (!machine.isEtapesOk(etapes)) {
                  console.warn(`https://camino.beta.gouv.fr/demarches/${demarche.slug} => démarche N*${index} "${demarcheDefinition.titreTypeIds.join(' ou ')}/${demarche.typeId}"`)
                  console.warn(machine.interpretMachine(etapes))
                  return null
                }
              }
              statut = machine.demarcheStatut(etapes)
              const phase = getPhase(statut)

              if ((phase?.debut ?? null) !== demarche.demarcheDateDebut || (phase?.fin ?? null) !== demarche.demarcheDateFin) {
                console.warn(
                  `https://camino.beta.gouv.fr/demarches/${demarche.slug} => date de debut ou de fin non conforme ${phase?.debut} -> ${demarche.demarcheDateDebut}, ${phase?.fin} -> ${demarche.demarcheDateFin}`
                )
                return null
              }
            }
          } catch (e) {
            console.error('something went wrong', e)
            console.error(`https://camino.beta.gouv.fr/demarches/${demarche.slug} => démarche N*${index} "${demarcheDefinition.titreTypeIds.join(' ou ')}/${demarche.typeId}"`)
            return null
          }

          const etapesAnonymes: Etape[] = etapes.map(etape => {
            return { ...etape, date: dateAddDays(etape.date, decalageJour) }
          })

          const demarcheDebut = demarcheEnregistrementDemandeDateFind(etapesAnonymes.map(etape => ({ ...etape, typeId: etape.etapeTypeId })))
          if (isNullOrUndefined(demarcheDebut)) {
            console.warn('pas de date de début, on ignore')
            return null
          }
          if (machineIdFind(demarche.titre!.typeId, demarche.typeId, demarche.id, demarcheDebut) !== demarcheDefinition.machineId) {
            console.warn('le décalage de jour fait sortir de la machine, on ignore')
            return null
          }

          return isNullOrUndefined(machine)
            ? null
            : {
                id: demarcheIdValidator.parse(`${index}`),
                titreTypeId: demarche.titre!.typeId,
                demarcheTypeId: demarche.typeId,
                etapes: etapesAnonymes,
                machineId: demarcheDefinition.machineId,
                statut: machine.demarcheStatut(etapesAnonymes),
              }
        })
      ))
    )
  }
  writeFileSync('src/business/rules-demarches/machines-cases.json', JSON.stringify(toutesLesEtapes.filter(isNotNullNorUndefined)))
}

writeEtapesForTest()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
