import { expect, test } from "vitest";
import { fondamentaleStepIsComplete } from "./etape-form";

test('fondamentaleStepIsComplete', () => {

  // Add tests here
  expect(fondamentaleStepIsComplete({duree: 0, substances: [],typeId: 'aac'}, "amo",'prr')).toBe(true)
})