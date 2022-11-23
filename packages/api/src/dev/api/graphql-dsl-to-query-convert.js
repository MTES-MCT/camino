import fetch from 'node-fetch'
const { getIntrospectionQuery } = require('graphql')
const fs = require('fs')
const url = `http://localhost:4000`

const dir = 'docs-sources/api'

fs.rm(`./${dir}`, { recursive: true, force: true }, err => {
  if (err) {
    throw err
  }
  fs.mkdirSync(`./${dir}`, { recursive: true })
})

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: getIntrospectionQuery() })
})
  .then(res => res.json())
  .then(res =>
    fs.writeFileSync(`${dir}/schemaon`, JSON.stringify(res.data, null, 2))
  )
