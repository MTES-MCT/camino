import { ITitreDemarche } from '../../../types'

const titreDemarchesIndefini: ITitreDemarche[] = [
  { statutId: 'ind', type: { id: 'oct' } }
] as ITitreDemarche[]

const titreDemarchesValide: ITitreDemarche[] = [
  {
    id: 'm-pr-saint-pierre-2014-oct01',
    titreId: 'm-pr-saint-pierre-2014',
    type: { id: 'oct', nom: 'unused', ordre: 1, etapesTypes: [] },
    typeId: 'oct',
    statutId: 'acc',
    ordre: 1,
    etapes: [
      {
        id: 'm-pr-saint-pierre-2014-oct01-dex01',
        titreDemarcheId: 'm-pr-saint-pierre-2014-oct01',
        typeId: 'dex',
        statutId: 'acc',
        ordre: 1,
        date: '2014-04-01',
        dateDebut: null,
        dateFin: '3014-04-01'
      }
    ]
  }
]

const titreDemarchesEchu: ITitreDemarche[] = [
  {
    id: 'm-pr-saint-pierre-1914-oct01',
    titreId: 'm-pr-saint-pierre-1914',
    type: { id: 'oct', nom: 'unused', ordre: 1, etapesTypes: [] },
    typeId: 'oct',
    statutId: 'acc',
    ordre: 1,
    etapes: [
      {
        id: 'm-pr-saint-pierre-2014-oct01-dex01',
        titreDemarcheId: 'm-pr-saint-pierre-2014-oct01',
        typeId: 'dex',
        statutId: 'acc',
        ordre: 1,
        date: '1014-04-01',
        dateDebut: null,
        dateFin: '2014-04-01'
      }
    ]
  }
]

const titreDemarchesOctroiInstruction: ITitreDemarche[] = [
  {
    id: 'm-pr-saint-pierre-2014-oct01',
    titreId: 'm-pr-saint-pierre-2014',
    type: { id: 'oct', nom: 'unused', ordre: 1, etapesTypes: [] },
    typeId: 'oct',
    statutId: 'ins',
    ordre: 1
  }
]

const titreDemarchesOctroiDepose: ITitreDemarche[] = [
  {
    id: 'm-pr-saint-pierre-2014-oct01',
    titreId: 'm-pr-saint-pierre-2014',
    type: { id: 'oct', nom: 'unused', ordre: 1, etapesTypes: [] },
    typeId: 'oct',
    statutId: 'dep',
    ordre: 1
  }
]

const titreDemarchesOctroiRejete: ITitreDemarche[] = [
  {
    id: 'm-pr-saint-pierre-2014-oct01',
    titreId: 'm-pr-saint-pierre-2014',
    type: { id: 'oct', nom: 'unused', ordre: 1, etapesTypes: [] },
    typeId: 'oct',
    statutId: 'rej',
    ordre: 1
  }
]

const titreDemarchesOctroiClasse: ITitreDemarche[] = [
  {
    id: 'm-pr-saint-pierre-2014-oct01',
    titreId: 'm-pr-saint-pierre-2014',
    type: { id: 'oct', nom: 'unused', ordre: 1, etapesTypes: [] },
    typeId: 'oct',
    statutId: 'cls',
    ordre: 1
  }
]

const titreDemarchesOctroiRetire: ITitreDemarche[] = [
  {
    id: 'm-pr-saint-pierre-2014-oct01',
    titreId: 'm-pr-saint-pierre-2014',
    type: { id: 'oct', nom: 'unused', ordre: 1, etapesTypes: [] },
    typeId: 'oct',
    statutId: 'des',
    ordre: 1
  }
]

const titreDemarchesInstruction: ITitreDemarche[] = [
  {
    id: 'm-pr-saint-pierre-2014-mut01',
    titreId: 'm-pr-saint-pierre-2014',
    type: { id: 'mut', nom: 'unused', ordre: 1, etapesTypes: [] },
    typeId: 'mut',
    statutId: 'ins',
    ordre: 1
  },
  {
    id: 'm-pr-saint-pierre-2014-oct01',
    titreId: 'm-pr-saint-pierre-2014',
    type: { id: 'oct', nom: 'unused', ordre: 1, etapesTypes: [] },
    typeId: 'oct',
    statutId: 'acc',
    ordre: 1
  }
]

const titrePERDemarchesProlongation: ITitreDemarche[] = [
  {
    id: 'm-pr-saint-pierre-2014-pro01',
    titreId: 'm-pr-saint-pierre-2014',
    type: { id: 'pr1', nom: 'unused', ordre: 1, etapesTypes: [] },
    typeId: 'pr1',
    statutId: 'eco',
    ordre: 1,
    etapes: [
      {
        date: '2020-01-01',
        typeId: 'mfr',
        statutId: 'fai',
        id: 'id',
        titreDemarcheId: 'm-pr-saint-pierre-2014-pro01'
      }
    ]
  },
  {
    id: 'm-pr-saint-pierre-2014-oct01',
    titreId: 'm-pr-saint-pierre-2014',
    type: { id: 'oct', nom: 'unused', ordre: 2, etapesTypes: [] },
    typeId: 'oct',
    statutId: 'acc',
    ordre: 1,
    etapes: [
      {
        id: 'm-pr-saint-pierre-2014-oct01-dex01',
        titreDemarcheId: 'm-pr-saint-pierre-2014-oct01',
        typeId: 'dex',
        statutId: 'acc',
        ordre: 1,
        date: '1014-04-01',
        dateDebut: null,
        dateFin: '2020-04-01'
      }
    ]
  }
]

export {
  titreDemarchesIndefini,
  titreDemarchesValide,
  titreDemarchesEchu,
  titreDemarchesOctroiInstruction,
  titreDemarchesOctroiDepose,
  titreDemarchesOctroiRejete,
  titreDemarchesOctroiClasse,
  titreDemarchesOctroiRetire,
  titreDemarchesInstruction,
  titrePERDemarchesProlongation
}
