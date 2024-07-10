import { Assertion, expect, test } from 'vitest'
import { nullToDefault, translateIssue } from './zod-tools'
import { z, ZodTypeAny } from 'zod'

test('nullToDefault', () => {
  expect(z.string().nullable().transform(nullToDefault('inCaseOfNull')).parse(null)).toBe('inCaseOfNull')
  expect(z.string().optional().transform(nullToDefault('inCaseOfNull')).parse(undefined)).toBe('inCaseOfNull')
  expect(z.string().optional().transform(nullToDefault('inCaseOfNull')).parse('value')).toBe('value')

  const myArray: string[] = []
  expect(z.array(z.string()).nullable().transform(nullToDefault(myArray)).parse(null)).toStrictEqual([])
  expect(z.array(z.string()).optional().transform(nullToDefault(myArray)).parse(undefined)).toStrictEqual([])
  expect(z.array(z.string()).optional().transform(nullToDefault(myArray)).parse(['toto'])).toStrictEqual(['toto'])
})

test.only('errorMessage', () => {
  const expectMessageError = (validator: ZodTypeAny, object: unknown): Assertion<string> => {
    const { success, error } = validator.safeParse(object)
    if (success) {
      throw new Error('Should have failed')
    }

    return expect(translateIssue(error.errors[0]))
  }

  expectMessageError(z.object({ nom: z.string() }), {}).toMatchInlineSnapshot(`"Le champ "nom" est obligatoire."`)
  expectMessageError(z.array(z.object({ nom: z.string() })), [{}]).toMatchInlineSnapshot(`"Le champ "nom" est obligatoire."`)
  expectMessageError(z.array(z.array(z.object({ nom: z.string() }))), [[{}]]).toMatchInlineSnapshot(`"Le champ "nom" est obligatoire."`)

  expectMessageError(z.object({ nom: z.string() }), []).toMatchInlineSnapshot(`"Le type "object" est attendu mais "array" a été reçu."`)
  expectMessageError(z.object({ nom: z.string() }), { nom: 3 }).toMatchInlineSnapshot(`"Le type du champ "nom" est incorrect, attendu "string" mais reçu "number"."`)

  expectMessageError(z.literal('toto'), 'titi').toMatchInlineSnapshot(`"La valeur "titi" doit être "toto"."`)
  expectMessageError(z.object({ nom: z.literal('toto') }), { nom: 'titi' }).toMatchInlineSnapshot(`"Le valeur du champ "nom" doit être "toto" mais reçu "titi"."`)

  expectMessageError(z.union([z.object({ nom: z.string() }), z.object({ prenom: z.string() })]), {}).toMatchInlineSnapshot(`"La valeur est invalide."`)
  expectMessageError(z.object({ nom: z.union([z.string(), z.number()]) }), { nom: true }).toMatchInlineSnapshot(`"Le valeur du champ "nom" est invalide."`)

  expectMessageError(z.discriminatedUnion('nom', [z.object({ nom: z.literal('nom') }), z.object({ nom: z.literal('name') })]), { nom: 'prenom' }).toMatchInlineSnapshot(
    `"Le valeur du champ "nom" doit être "nom" ou "name"."`
  )

  expectMessageError(z.enum(['toto', 'titi']), 'tata').toMatchInlineSnapshot(`"La valeur doit être "toto" ou "titi" mais reçu "tata"."`)
  expectMessageError(z.object({ nom: z.enum(['toto', 'titi']) }), { nom: 'tata' }).toMatchInlineSnapshot(`"Le valeur du champ "nom" doit être "toto" ou "titi" mais reçu "tata"."`)

  expectMessageError(z.string().includes('nom'), 'address').toMatchInlineSnapshot(`"La valeur doit contenir "nom"."`)
  expectMessageError(z.object({ prenom: z.string().includes('nom') }), { prenom: 'address' }).toMatchInlineSnapshot(`"La valeur du champ "prenom" doit contenir "nom"."`)
  expectMessageError(z.string().startsWith('nom'), 'address').toMatchInlineSnapshot(`"La valeur doit commencer par "nom"."`)
  expectMessageError(z.string().endsWith('nom'), 'address').toMatchInlineSnapshot(`"La valeur doit finir par "nom"."`)
  expectMessageError(z.string().regex(/nom/), 'address').toMatchInlineSnapshot(`"La valeur est invalide."`)
  expectMessageError(z.string().email(), 'address').toMatchInlineSnapshot(`"La valeur est invalide, on s'attend à un type "email"."`)

  expectMessageError(z.array(z.number()).min(2), []).toMatchInlineSnapshot(`"La valeur doit être un tableau avec au moins 2 élément(s)."`)
  expectMessageError(z.object({ prenoms: z.array(z.string()).min(2) }), { prenoms: [] }).toMatchInlineSnapshot(`"La valeur du champ "prenoms" doit être un tableau avec au moins 2 élément(s)."`)
  expectMessageError(z.array(z.number()).max(1), [2, 3, 4]).toMatchInlineSnapshot(`"La valeur doit être un tableau avec au plus 1 élément(s)."`)
  expectMessageError(z.array(z.number()).length(1), [2, 3, 4]).toMatchInlineSnapshot(`"La valeur doit être un tableau avec exactement 1 élément(s)."`)
  expectMessageError(z.array(z.number()).nonempty(), []).toMatchInlineSnapshot(`"La valeur doit être un tableau avec au moins 1 élément(s)."`)

  expectMessageError(z.number().gt(2), 1).toMatchInlineSnapshot(`"La valeur doit être un nombre plus grand que 2."`)
  expectMessageError(z.number().gte(2), 1).toMatchInlineSnapshot(`"La valeur doit être un nombre plus grand ou égal à 2."`)
  expectMessageError(z.number().lt(2), 3).toMatchInlineSnapshot(`"La valeur doit être un nombre plus petit que 2."`)
  expectMessageError(z.number().lte(2), 3).toMatchInlineSnapshot(`"La valeur doit être un nombre plus petit ou égal à 2."`)
  expectMessageError(z.number().positive(), -3).toMatchInlineSnapshot(`"La valeur doit être un nombre plus grand que 0."`)
  expectMessageError(z.number().nonnegative(), -3).toMatchInlineSnapshot(`"La valeur doit être un nombre plus grand ou égal à 0."`)
  expectMessageError(z.number().negative(), 2).toMatchInlineSnapshot(`"La valeur doit être un nombre plus petit que 0."`)
  expectMessageError(z.number().nonpositive(), 2).toMatchInlineSnapshot(`"La valeur doit être un nombre plus petit ou égal à 0."`)

  expectMessageError(z.string().length(2), '1').toMatchInlineSnapshot(`"La valeur doit être une chaine de caractère avec exactement 2 caractère(s)."`)
  expectMessageError(z.string().max(3), '12345').toMatchInlineSnapshot(`"La valeur doit être une chaine de caractère avec au plus 3 caractère(s)."`)
  expectMessageError(z.string().min(3), '12').toMatchInlineSnapshot(`"La valeur doit être une chaine de caractère avec au moins 3 caractère(s)."`)

  const customValidator = z.custom<`plop:${'toto' | 'tata'}`>(
    val => {
      if (typeof val !== 'string') {
        return false
      }

      return val.startsWith('plop') && (val.endsWith('toto') || val.endsWith('tata'))
    },
    { message: "Le customValidator n'est pas correct." }
  )
  expectMessageError(customValidator, 'toto').toMatchInlineSnapshot(`"Le customValidator n'est pas correct."`)
})
