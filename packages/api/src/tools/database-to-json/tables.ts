// Liste des noms des tables à sauvegarder au format json
export const tables = [
  // la table 'caches' n'est pas utile dans les json
  // { name: 'caches',orderBy: ['id'] },
  { name: 'communes', orderBy: ['id'] },
  { name: 'documents', orderBy: ['id'] },
  { name: 'entreprises', orderBy: ['id'] },
  { name: 'entreprises_etablissements', orderBy: ['id'] },
  { name: 'titres', orderBy: ['id'] },
  { name: 'titres_activites', orderBy: ['id'] },
  { name: 'titres_amodiataires', orderBy: ['titre_etape_id', 'entreprise_id'] },
  { name: 'titres_demarches', orderBy: ['id'] },
  { name: 'titres_etapes', orderBy: ['id'] },
  {
    name: 'titres_etapes_entreprises_documents',
    orderBy: ['titre_etape_id', 'document_id'],
  },
  { name: 'titres_titulaires', orderBy: ['titre_etape_id', 'entreprise_id'] },
  { name: 'utilisateurs', orderBy: ['id'] },
  {
    name: 'utilisateurs__entreprises',
    orderBy: ['utilisateur_id', 'entreprise_id'],
  },
]
