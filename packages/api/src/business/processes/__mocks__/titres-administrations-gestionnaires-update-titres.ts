import Titres from '../../../database/models/titres'
import Administrations from '../../../database/models/administrations'

const administrations = [
  { id: 'dgec' },
  { id: 'dgaln' },
  { id: 'ptmg' }
] as unknown as Administrations[]

const titresAdministrationGestionnaireVide = [
  { id: 'titre-id', domaineId: 'm' }
] as Titres[]

const titresAdministrationGestionnaireInexistante = [
  {
    id: 'titre-id',
    administrationsGestionnaires: [{ id: 'inexistante' }]
  }
] as unknown as Titres[]

const titresAdministrationGestionnaireExistante = [
  {
    id: 'titre-id',
    administrationsGestionnaires: [{ id: 'dgec' }]
  }
] as unknown as Titres[]

export {
  administrations,
  titresAdministrationGestionnaireVide,
  titresAdministrationGestionnaireInexistante,
  titresAdministrationGestionnaireExistante
}
