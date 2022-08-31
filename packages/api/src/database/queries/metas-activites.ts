import { IFields } from '../../types'

import options from './_options'
import graphBuild from './graph/build'
import { fieldsFormat } from './graph/fields-format'

import ActivitesTypes from '../models/activites-types'
import ActivitesTypesTitresTypes from '../models/activites-types--titres-types'
import ActivitesStatuts from '../models/activites-statuts'
import ActivitesTypesDocumentsTypes from '../models/activites-types--documents-types'
import ActivitesTypesPays from '../models/activites-types--pays'

export const activitesTypesGet = async ({ fields }: { fields?: IFields }) => {
  const graph = fields
    ? graphBuild(fields, 'activitesTypes', fieldsFormat)
    : options.activitesTypes.graph

  return ActivitesTypes.query().withGraphFetched(graph).modify('orderAsc')
}

export const activitesStatutsGet = async () => ActivitesStatuts.query()

export const activitesTypesTitresTypesGet = async () =>
  ActivitesTypesTitresTypes.query()

export const activitesTypesDocumentsTypesGet = async () =>
  ActivitesTypesDocumentsTypes.query()

export const activitesTypesPaysGet = async () => ActivitesTypesPays.query()
