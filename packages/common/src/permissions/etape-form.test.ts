import { expect, test } from "vitest";
import { fondamentaleStepIsComplete } from "./etape-form";

// FIXME Add lot of tests here

test('fondamentaleStepIsComplete', () => {

  // FIXME Add tests here
  expect(fondamentaleStepIsComplete({duree: 0, substances: [],typeId: 'aac'}, "amo",'prr')).toBe(true)
})