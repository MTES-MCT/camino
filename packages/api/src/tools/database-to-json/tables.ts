// Liste des noms des tables à sauvegarder au format json
export const tables = [
  { name: 'activites_types', orderBy: ['id'] },
  {
    name: 'activites_types__documents_types',
    orderBy: ['activite_type_id', 'document_type_id']
  },
  { name: 'activites_types__pays', orderBy: ['pays_id', 'activite_type_id'] },
  {
    name: 'activites_types__titres_types',
    orderBy: ['titre_type_id', 'activite_type_id']
  },
  {
    name: 'administrations__activites_types',
    orderBy: ['activite_type_id', 'administration_id']
  },
  // la table 'caches' n'est pas utile dans les json
  // { name: 'caches',orderBy: ['id'] },
  { name: 'communes', orderBy: ['id'] },
  { name: 'demarches_types', orderBy: ['id'] },
  { name: 'documents', orderBy: ['id'] },
  { name: 'documents_types', orderBy: ['id'] },
  { name: 'domaines', orderBy: ['id'] },
  { name: 'entreprises', orderBy: ['id'] },
  { name: 'entreprises__documents_types', orderBy: ['document_type_id'] },
  { name: 'entreprises_etablissements', orderBy: ['id'] },
  { name: 'etapes_types', orderBy: ['id'] },
  {
    name: 'etapes_types__justificatifs_types',
    orderBy: ['etape_type_id', 'document_type_id']
  },
  { name: 'forets', orderBy: ['id'] },
  { name: 'titres', orderBy: ['id'] },
  { name: 'titres_activites', orderBy: ['id'] },
  { name: 'titres_amodiataires', orderBy: ['titre_etape_id', 'entreprise_id'] },
  { name: 'titres_communes', orderBy: ['titre_etape_id', 'commune_id'] },
  { name: 'titres_demarches', orderBy: ['id'] },
  {
    name: 'titres_demarches_liens',
    orderBy: ['enfant_titre_demarche_id', 'parent_titre_demarche_id']
  },
  { name: 'titres_etapes', orderBy: ['id'] },
  {
    name: 'titres_etapes_justificatifs',
    orderBy: ['titre_etape_id', 'document_id']
  },
  { name: 'titres_forets', orderBy: ['titre_etape_id', 'foret_id'] },
  { name: 'titres_phases', orderBy: ['titre_demarche_id', 'phase_statut_id'] },
  { name: 'titres_points', orderBy: ['id'] },
  { name: 'titres_points_references', orderBy: ['id'] },
  { name: 'titres_titulaires', orderBy: ['titre_etape_id', 'entreprise_id'] },
  { name: 'titres_types', orderBy: ['id'] },
  {
    name: 'titres_types__demarches_types',
    orderBy: ['titre_type_id', 'demarche_type_id']
  },
  {
    name: 'titres_types__demarches_types__etapes_types',
    orderBy: ['titre_type_id', 'demarche_type_id', 'etape_type_id']
  },
  {
    name: 'titres_types__demarches_types__etapes_types__justificatifs_t',
    orderBy: [
      'titre_type_id',
      'demarche_type_id',
      'etape_type_id',
      'document_type_id'
    ]
  },
  { name: 'titres_types_types', orderBy: ['id'] },
  { name: 'utilisateurs', orderBy: ['id'] },
  {
    name: 'utilisateurs__entreprises',
    orderBy: ['utilisateur_id', 'entreprise_id']
  }
]
