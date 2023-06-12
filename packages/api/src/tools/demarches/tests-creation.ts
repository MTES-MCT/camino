import '../../init.js'

import { titresDemarchesGet } from '../../database/queries/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import { titreDemarcheDepotDemandeDateFind } from '../../business/rules/titre-demarche-depot-demande-date-find.js'
import { writeFileSync } from 'fs'
import { Etape, titreEtapeForMachineValidator, toMachineEtapes } from '../../business/rules-demarches/machine-common.js'
import { demarchesDefinitions } from '../../business/rules-demarches/definitions.js'
import { dateAddDays, daysBetween, setDayInMonth } from 'camino-common/src/date.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'
import { toCommuneId } from 'camino-common/src/static/communes.js'

const writeEtapesForTest = async () => {
  for (const demarcheDefinition of demarchesDefinitions) {
    const demarches = await titresDemarchesGet(
      {
        titresTypesIds: [demarcheDefinition.titreTypeId.slice(0, 2)],
        titresDomainesIds: [demarcheDefinition.titreTypeId.slice(2)],
        typesIds: demarcheDefinition.demarcheTypeIds,
      },
      {
        fields: {
          titre: { id: {}, demarches: { etapes: { id: {} } } },
          etapes: { communes: { id: {} } },
          type: { etapesTypes: { id: {} } },
        },
      },
      userSuper
    )

    const toutesLesEtapes = demarches
      .filter(demarche => demarche.etapes?.length)
      .filter(demarche => {
        const date = titreDemarcheDepotDemandeDateFind(demarche.etapes!)

        return (date ?? '') > demarcheDefinition.dateDebut && !demarcheDefinition.demarcheIdExceptions?.includes(demarche.id)
      })
      .map((demarche, index) => {
        const etapes: Etape[] = toMachineEtapes(
          (
            demarche?.etapes
              ?.sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
              ?.map(etape => {
                if (etape?.contenu?.arm) {
                  etape.contenu = { arm: etape.contenu?.arm }
                } else {
                  delete etape.contenu
                }

                if (etape.communes?.length) {
                  etape.communes = etape.communes.map(({ id }) => ({ nom: '', id: toCommuneId(`${id.startsWith('97') ? `${id.substring(0, 3)}00` : `${id.substring(0, 2)}000`}}`) }))
                }

                return etape
              }) ?? []
          ).map(etape => titreEtapeForMachineValidator.parse(etape))
        )
        // Pour anonymiser la date en gardant les délai en mois entre la saisine et l'apd,
        // on trouve la date de saisine et on calcule un delta random pour tomber dans le même mois
        const firstSaisineDate = etapes.find(etape => etape.etapeTypeId === ETAPES_TYPES.saisineDesServices)?.date ?? etapes[0].date
        const decalageJour = daysBetween(firstSaisineDate, setDayInMonth(firstSaisineDate, Math.floor(Math.random() * 28)))
        try {
          if (!demarcheDefinition.machine.isEtapesOk(etapes)) {
            etapes.splice(0, etapes.length, ...demarcheDefinition.machine.orderMachine(etapes))
            if (!demarcheDefinition.machine.isEtapesOk(etapes)) {
              console.warn(`https://camino.beta.gouv.fr/titres/${demarche.titreId} => démarche N*${index} (${demarche.id}) "${demarcheDefinition.titreTypeId}/${demarche.typeId}"`)
            }
          }
        } catch (e) {
          console.error('something went wrong', e)
          console.error(`https://camino.beta.gouv.fr/titres/${demarche.titreId} => démarche N*${index} (${demarche.id}) "${demarcheDefinition.titreTypeId}/${demarche.typeId}"`)
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
    writeFileSync(`src/business/rules-demarches/${demarcheDefinition.titreTypeId}/${demarcheDefinition.demarcheTypeIds[0]}.cas.json`, JSON.stringify(toutesLesEtapes))
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
