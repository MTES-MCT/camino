import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import Titres from '../../../database/models/titres'

const titresAdministrationGestionnaireVide = [
  { id: 'titre-id', typeId: 'arm', domaineId: 'm' }
] as Titres[]

const titresAdministrationGestionnaireInexistante = [
  {
    id: 'titre-id',
    typeId: 'aph',
    administrationsGestionnaires: [
      { id: ADMINISTRATION_IDS['PRÉFECTURE - ALLIER'] }
    ]
  }
] as unknown as Titres[]

const titresAdministrationGestionnaireExistante = [
  {
    id: 'titre-id',
    typeId: 'aph',
    administrationsGestionnaires: [{ id: ADMINISTRATION_IDS['DGEC/DE/SD2/2A'] }]
  }
] as unknown as Titres[]

export {
  titresAdministrationGestionnaireVide,
  titresAdministrationGestionnaireInexistante,
  titresAdministrationGestionnaireExistante
}
