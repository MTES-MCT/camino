import { bodyBuilder } from './entreprises'

const entreprise = { categorie: 'PME', nom: 'ma companie' }

describe('construit le corps de la requête pour openFisca', () => {
  test('sans activités', () => {
    expect(bodyBuilder([], [], 2022, entreprise)).toEqual({
      articles: {},
      communes: {},
      titres: {}
    })
  })

  test('avec activiteés', () => {
    const activites = [
      { titreId: 'titre2', contenu: { substancesFiscales: { auru: 39.715 } } },
      { titreId: 'titre3', contenu: { substancesFiscales: { auru: 0 } } },
      { titreId: 'titre1', contenu: { substancesFiscales: { auru: 0 } } },
      { titreId: 'titre4', contenu: { substancesFiscales: { auru: 0 } } },
      { titreId: 'titre5', contenu: { substancesFiscales: { auru: 8.91 } } }
    ]
    const titres = [
      {
        substances: [{ id: 'auru', nom: 'or', legales: [] }],
        communes: [
          { id: '97310', nom: 'Roura', departementId: '973', surface: 1006827 }
        ],
        id: 'titreSansActivite'
      },
      {
        substances: [
          { id: 'auru', nom: 'or', legales: [] },
          { id: 'suco', nom: 'substances connexes', legales: [] }
        ],
        communes: [
          { id: '97310', nom: 'Roura', departementId: '973', surface: 6036587 }
        ],
        id: 'titre1'
      },
      {
        substances: [
          { id: 'auru', nom: 'or', legales: [] },
          { id: 'suco', nom: 'substances connexes', legales: [] }
        ],
        communes: [
          { id: '97310', nom: 'Roura', departementId: '973', surface: 19805494 }
        ],
        id: 'titre2'
      },
      {
        substances: [
          { id: 'auru', nom: 'or', legales: [] },
          { id: 'suco', nom: 'substances connexes', legales: [] }
        ],
        communes: [
          { id: '97310', nom: 'Roura', departementId: '973', surface: 5143845 }
        ],
        id: 'titre3'
      },
      {
        substances: [
          { id: 'auru', nom: 'or', legales: [] },
          { id: 'suco', nom: 'substances connexes', legales: [] }
        ],
        communes: [
          { id: '97310', nom: 'Roura', departementId: '973', surface: 7676552 }
        ],
        id: 'titre4'
      },
      {
        substances: [
          { id: 'suco', nom: 'substances connexes', legales: [] },
          { id: 'auru', nom: 'or', legales: [] }
        ],
        communes: [
          {
            id: '97311',
            nom: 'Saint-Laurent-du-Maroni',
            departementId: '973',
            surface: 35604009
          }
        ],
        id: 'titre5'
      }
    ]

    expect(bodyBuilder(activites, titres, 2022, entreprise)).toMatchSnapshot()
  })
})
