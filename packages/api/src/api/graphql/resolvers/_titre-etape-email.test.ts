import { emailsForAdministrationsGet } from './_titre-etape-email'
import { IEtapeType, ITitreEtape, IUtilisateur } from '../../../types'
import { userSuper } from '../../../database/user-super'
import { newDemarcheId } from '../../../database/models/_format/id-create'

test('envoie un email sur une étape non existante', () => {
  const actual = emailsForAdministrationsGet(
    undefined,
    undefined,
    '',
    '',
    '',
    userSuper,
    undefined
  )

  expect(actual).toBe(null)
})
const etape: ITitreEtape = {
  id: 'bCbIOAqNyVH0vl1Jn1AG8Bt1',
  titreDemarcheId: newDemarcheId('6zaBy4eRzTHVFFLhHCB433x2'),
  typeId: 'mdp',
  statutId: 'fai',
  ordre: null,
  date: '2022-04-15',
  dateDebut: null,
  dateFin: null,
  duree: null,
  surface: null,
  contenu: null,
  incertitudes: null,
  heritageProps: null,
  heritageContenu: null,
  slug: '6zaBy4eRzTHVFFLhHCB433x2-mdp99',
  decisionsAnnexesSections: null,
  decisionsAnnexesContenu: null,
  points: [],
  type: {
    id: 'mdp',
    nom: 'dépôt de la demande',
    description:
      "Le dépôt de la demande formalise la prise en charge de la demande par l'administration compétente. Cette étape fait l’objet d’un accusé de réception qui informe le demandeur des modalités d’instruction, du délai au-delà duquel une décision implicite d’accord ou de rejet sera formée et des voies de recours.",
    ordre: 6,
    fondamentale: null,
    unique: true,
    acceptationAuto: true,
    dateDebut: null,
    dateFin: null,
    sections: null,
    publicLecture: true,
    entreprisesLecture: true
  },
  justificatifs: [],
  substances: [],
  documents: [],
  amodiataires: [],
  titulaires: [],
  administrations: [],
  communes: [],
  forets: []
}
const etapeType: IEtapeType = {
  id: 'mdp',
  nom: 'dépôt de la demande',
  description:
    "Le dépôt de la demande formalise la prise en charge de la demande par l'administration compétente. Cette étape fait l’objet d’un accusé de réception qui informe le demandeur des modalités d’instruction, du délai au-delà duquel une décision implicite d’accord ou de rejet sera formée et des voies de recours.",
  ordre: 6,
  fondamentale: null,
  unique: true,
  acceptationAuto: true,
  dateDebut: null,
  dateFin: null,
  sections: null,
  publicLecture: true,
  entreprisesLecture: true
}
const user: IUtilisateur = {
  id: 'super',
  email: 'camino@beta.gouv.fr',
  nom: 'Camino',
  role: 'super',
  dateCreation: '2022-05-12',
  administrationId: undefined
}

test("envoie un email sur un octroi d'AEX", () => {
  const actual = emailsForAdministrationsGet(
    etape,
    etapeType,
    'oct',
    'titreId',
    'axm',
    user,
    undefined
  )

  expect(actual).toMatchSnapshot()
})

test("envoie un email sur un octroi d'ARM", () => {
  const actual = emailsForAdministrationsGet(
    etape,
    etapeType,
    'oct',
    'titreId',
    'arm',
    user,
    undefined
  )

  expect(actual).toMatchSnapshot()
})
