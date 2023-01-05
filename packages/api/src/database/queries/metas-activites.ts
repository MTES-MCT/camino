import { IFields } from '../../types.js'

import options from './_options.js'
import graphBuild from './graph/build.js'
import { fieldsFormat } from './graph/fields-format.js'

import ActivitesTypes from '../models/activites-types.js'
import ActivitesTypesTitresTypes from '../models/activites-types--titres-types.js'
import ActivitesTypesDocumentsTypes from '../models/activites-types--documents-types.js'
import ActivitesTypesPays from '../models/activites-types--pays.js'

export const activitesTypesGet = async ({ fields }: { fields?: IFields }) => {
  const graph = fields
    ? graphBuild(fields, 'activitesTypes', fieldsFormat)
    : options.activitesTypes.graph

  return ActivitesTypes.query().withGraphFetched(graph).modify('orderAsc')
}

export const activitesTypesTitresTypesGet = async () =>
  ActivitesTypesTitresTypes.query()

export const activitesTypesDocumentsTypesGet = async () =>
  ActivitesTypesDocumentsTypes.query()

export const activitesTypesPaysGet = async () => ActivitesTypesPays.query()
