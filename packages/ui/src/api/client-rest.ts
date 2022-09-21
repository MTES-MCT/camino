type Loading = { status: 'LOADING' }
type Error = { status: 'ERROR'; message: string }

export type AsyncData<T> = Loading | { status: 'LOADED'; value: T } | Error

export const fetchWithJson = async <T>(url: string): Promise<T> => {
  const fetched = await fetch(url)
  const body = await fetched.json()
  if (fetched.ok) {
    return body
  }
  console.error(
    `Une erreur s'est produite lors de la récupération des données ${JSON.stringify(
      body
    )}`
  )
  throw new Error(
    `Une erreur s'est produite lors de la récupération des données`
  )
}
