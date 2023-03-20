const metasColonnes = [
  {
    id: 'nom',
    name: 'Nom',
  },
]

const metasLignesBuild = metas =>
  metas.map(meta => {
    const columns = {
      nom: { value: meta.nom },
    }

    const link = meta.linkName ? { name: meta.linkName } : { name: 'meta', params: { id: meta.id } }

    return {
      id: meta.id,
      link,
      columns,
    }
  })

export { metasColonnes, metasLignesBuild }
