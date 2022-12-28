## Ruled Validator

> Type-friendly JSON based validator engine like https://ant.design/components/form/#Rule

### Usage

![](https://img.shields.io/npm/v/@worktools/ruled-validator.svg?style=flat-square)

```bash
yarn add @worktools/ruled-validator
```

`ruledValidate(x, rules)` returns a string for a failure, returns `undefined` for ok.

```ts
import { RuledRules, RuledRuleEntry, ruledValidate } from "@worktools/ruled-validator";

let stringLengthRules: RuledRuleEntry = {
  type: "string",
  failText: "required string",
  next: [
    { type: "max-length", n: 4, failText: "too long" },
    { type: "min-length", n: 2, failText: "too short" },
    { type: "regex", regex: /^[a-zA-Z]+$/, failText: "not letters" },
    { type: "fn", test: (x) => !x.includes("X"), failText: "X invalid" },
  ],
};

expect(ruledValidate("1", stringLengthRules)).toBe("too short");
```

### Types

Validation rules are not nested in an arbitrary ways. Notice the structure:

| Top-level type | Sub type       | Options                | Usage                                      |
| -------------- | -------------- | ---------------------- | ------------------------------------------ |
| **string**     |                |                        |                                            |
|                |                | `rejectEmpty`: boolean | treat `""` as invalid                      |
|                |                | `rejectBlank`: boolean | treat `""` and `" "` as invalid            |
|                | max-length     | `n`: number            |                                            |
|                | min-length     | `n`: number            |                                            |
|                | regex          | `regex`: RegExp        |                                            |
|                | email          |                        |                                            |
|                | non-chinese    |                        |                                            |
|                | fn             | `test`: Function       |                                            |
| **array**      |                |                        |                                            |
|                |                | `rejectEmpty`: boolean | treat `[]` as invalid                      |
|                | max-length     | `n`: number            |                                            |
|                | min-length     | `n`: number            |                                            |
|                | fn             | `test`: Function       |                                            |
| **number**     |                |                        |                                            |
|                | max            | `n`: number            |                                            |
|                |                | `rejectEqual`: boolean | treat `n` as invalid                       |
|                | min            | `n`: number            |                                            |
|                |                | `rejectEqual`: boolean | treat `n` as invalid                       |
|                | fn             | `test`: Function       |                                            |
| **object**     |                |                        |                                            |
|                | fn             | `test`: Function       |                                            |
| **boolean**    |                |                        |                                            |
| **required**   | _all types..._ |                        | this is special, most times can be omitted |
| **fn**         |                | `test`: Function       | custom validation funcion, returns boolean |
| **registered** |                |                        |                                            |
|                |                | `name`: string         |                                            |
|                |                | `options`: object      |                                            |

### Registered type

In app level, use `registerRuledValidatorRule` to create rules in `registered` type for custom quick validations.

```ts
import { registerRuledValidatorRule } from "@jimengio/ruled-validator";

registerRuledValidatorRule("email", (x: string, options) => {
  if (typeof x !== "string") {
    return false;
  }
  return /^\w+@\w+\.\w+$/.test(x);
});

let stringEmailRule: RuledRuleEntry = {
  type: "string",
  failText: "required string",
  next: [{ type: "registered", name: "email", failText: "invalid email" }],
};

expect(ruledValidate("x", emailRule)).toBe("invalid email");
expect(ruledValidate("x@a.b", emailRule)).toBe(undefined);
```

To treat empty strings/arrays as null, use `rejectEmpty`(`""`, `[]`) or `rejectBlank`(e.g. `" "`).

### Workflow

https://github.com/jimengio/ts-workflow

### License

MIT
