import Globales from '../models/globales'

export const globaleGet = async (id: string) => Globales.query().findById(id)
