import '../../init'

import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { userSuper } from '../../database/user-super'
import { titreDemarcheDepotDemandeDateFind } from '../../business/rules/titre-demarche-depot-demande-date-find'
import { Etape } from '../../business/rules-demarches/arm/oct.machine'
import { writeFileSync } from 'fs'
import {
  isEtapesOk,
  toMachineEtape
} from '../../business/rules-demarches/machine-helper'

const writeEtapesForTest = async () => {
  const demarcheDefinition = {
    titreTypeId: 'arm',
    demarcheTypeIds: ['oct'],
    dateDebut: '2019-10-31'
  }
  const demarches = await titresDemarchesGet(
    {
      titresTypesIds: [demarcheDefinition.titreTypeId.slice(0, 2)],
      titresDomainesIds: [demarcheDefinition.titreTypeId.slice(2)],
      typesIds: demarcheDefinition.demarcheTypeIds
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

  const toutesLesEtapes = demarches
    .filter(demarche => demarche.etapes?.length)
    .filter(demarche => {
      const date = titreDemarcheDepotDemandeDateFind(demarche.etapes!)

      return (date ?? '') > demarcheDefinition.dateDebut
    })
    .map((demarche, index) => {
      const etapes: Etape[] =
        demarche?.etapes
          ?.sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
          ?.map(etape => {
            if (etape?.contenu?.arm) {
              etape.contenu = { arm: etape.contenu?.arm }
            } else {
              delete etape.contenu
            }

            return toMachineEtape(etape)
          }) ?? []
      try {
        if (!isEtapesOk(etapes)) {
          console.warn(
            `https://camino.beta.gouv.fr/titres/${demarche.titreId} => démarche "${demarche.typeId}"`
          )
        }
      } catch (e) {
        console.error(
          `https://camino.beta.gouv.fr/titres/${demarche.titreId} => démarche "${demarche.typeId}"`
        )
      }

      const etapesAnonymes = etapes.map((etape, index) => {
        return { ...etape, date: index.toString() }
      })

      return { id: index, etapes: etapesAnonymes }
    })
  writeFileSync(
    'src/business/rules-demarches/arm/oct.cas.json',
    JSON.stringify(toutesLesEtapes)
  )
}

writeEtapesForTest()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
