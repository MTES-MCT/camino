const debug = process.env.NODE_DEBUG === 'true'
const port = Number(process.env.API_PORT)
const url = `http://localhost:${port}/`

export { port, url, debug }
