import E from 'fp-ts/lib/Either'
import T from 'fp-ts/lib/Task'
import TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import Console from 'fp-ts/lib/Console'

interface Product {
  count: number
  pricePerItem: number
}

interface PTD {
  // ProductTaxDelivery
  product: Product
  t: number
  d: number
}

// <A>(a: A) => Task<void>
const taskLog = T.fromIOK(Console.log)

// You can still keep getProduct and getTask synchronous
function getProduct(): E.Either<Error, Product> {
  return E.right({ count: 10, pricePerItem: 5 })
}
function getTax(p: Product): E.Either<Error, number> {
  return E.right(p.pricePerItem * p.count * 0.085)
}

function getDelivery(p: Product): TE.TaskEither<Error, number> {
  return TE.right(p.count * 0.05)
}

const run: TE.TaskEither<Error, PTD> = pipe(
  TE.Do,
  // See below for what TE.fromEither(K) does
  TE.bind('product', TE.fromEitherK(getProduct)),
  TE.bind('tax', ({ product }) => TE.fromEither(getTax(product))),
  TE.bind('delivery', ({ product }) => getDelivery(product)),
  TE.map(({ product, tax, delivery }) => ({ product, t: tax, d: delivery }))
)

const main: T.Task<void> = pipe(
  run,
  TE.fold(
    e => taskLog(`error: ${e}`),
    it => taskLog(`ok ${it.product.count} ${it.product.pricePerItem} ${it.t} ${it.d}`)
  )
)

main().catch(console.error)
