/* eslint-disable camelcase */
import { readFileSync } from 'fs'
import { join } from 'path'

import {
  IAdministration,
  IAdministrationTitreTypeEtapeType,
  IAdministrationTitreTypeTitreStatut,
  IEtapeType,
  ITitreType
} from '../../src/types'

import {
  Administration,
  Administrations
} from 'camino-common/src/static/administrations'

interface ISources {
  titresTypes: {
    path: string
    data: ITitreType[]
  }
  administrations__titresTypes__titresStatuts: {
    path: string
    data: IAdministrationTitreTypeTitreStatut[]
  }
  administrations__titresTypes__etapesTypes: {
    path: string
    data: IAdministrationTitreTypeEtapeType[]
  }
  etapesTypes: { path: string; data: IEtapeType[] }
}

const sources = {
  titresTypes: { path: '../../sources/titres-types.json', data: [] },
  administrations__titresTypes__titresStatuts: {
    path: '../../sources/administrations--titres-types--titres-statuts.json',
    data: []
  },
  administrations__titresTypes__etapesTypes: {
    path: '../../sources/administrations--titres-types--etapes-types.json',
    data: []
  },
  etapesTypes: { path: '../../sources/etapes-types.json', data: [] }
} as ISources

const readFile = (filePath: string) =>
  JSON.parse(readFileSync(join(__dirname, filePath)).toString())

type ITruc = IObject | IObject[] | any

interface IObject {
  [key: string]: ITruc
}

// convertit les clés en camel-case
const jsonKeysCaseChange = (val: ITruc): ITruc => {
  if (typeof val !== 'object') {
    if (typeof val === 'string' && val === 'true') {
      return true
    }

    if (typeof val === 'string' && val === 'false') {
      return false
    }

    return val
  }

  if (Array.isArray(val)) {
    return val.map(jsonKeysCaseChange)
  }

  return objectKeysCaseChange(val)
}

const objectKeysCaseChange = (obj: IObject) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      //            ( )     |  un groupement contenant
      //             .      |  n'importe quel caractère
      //           _        |  précédé d'un underscore
      key.replace(/_(.)/g, g => g[1].toUpperCase()),
      jsonKeysCaseChange(val)
    ])
  )

Object.keys(sources).forEach(name => {
  const element = sources[name as keyof ISources]

  element.data = jsonKeysCaseChange(readFile(element.path))
})

const administrationsWithRelations = Object.values(
  Administrations
).map<IAdministration>((a: Administration) => {
  const dbadmin: IAdministration = { ...a }

  dbadmin.titresTypesTitresStatuts =
    sources.administrations__titresTypes__titresStatuts.data
      .filter(attts => attts.administrationId === a.id)
      .map(attts => {
        attts.titreType = sources.titresTypes.data.find(
          tt => tt.id === attts.titreTypeId
        )

        return attts
      })

  dbadmin.titresTypesEtapesTypes =
    sources.administrations__titresTypes__etapesTypes.data
      .filter(attet => attet.administrationId === a.id)
      .map(attet => {
        attet.titreType = sources.titresTypes.data.find(
          tt => tt.id === attet.titreTypeId
        )
        attet.etapeType = sources.etapesTypes.data.find(
          te => te.id === attet.etapeTypeId
        )

        return attet
      })

  return dbadmin
})

export { administrationsWithRelations }
