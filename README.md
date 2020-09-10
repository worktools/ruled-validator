## Ruled Validator

> Type-friendly JSON based validator engine like https://ant.design/components/form/#Rule

### Usage

![](https://img.shields.io/npm/v/@jimengio/ruled-validator.svg?style=flat-square)

```bash
yarn add @jimengio/ruled-validator
```

`ruledValidate(x, rules)` returns a string for a failure, returns `undefined` for ok.

```ts
import { RuledRules, ruledValidate } from "@jimengio/ruled-validator";

let stringLengthRules: RuledRules = [
  {
    type: "string",
    failText: "required string",
    next: [
      { type: "max-length", n: 4, failText: "too long" },
      { type: "min-length", n: 2, failText: "too short" },
      { type: "regex", regex: /^[a-zA-Z]+$/, failText: "not letters" },
      { type: "fn", test: (x) => !x.includes("X"), failText: "X invalid" },
    ],
  },
];

expect(ruledValidate("1", stringLengthRules)).toBe("too short");
```

In app level, use `registerRuledValidatorRule` to create rules in `registered` type for custom quick validations.

```ts
import { registerRuledValidatorRule } from "@jimengio/ruled-validator";

registerRuledValidatorRule("email", (x: string, options) => {
  if (typeof x !== "string") {
    return false;
  }
  return /^\w+@\w+\.\w+$/.test(x);
});

let stringEmailRule: RuledRules = [
  {
    type: "string",
    failText: "required string",
    next: [{ type: "registered", name: "email", failText: "invalid email" }],
  },
];

expect(ruledValidate("x", emailRule)).toBe("invalid email");
expect(ruledValidate("x@a.b", emailRule)).toBe(undefined);
```

To treat empty strings/arrays as null, use `rejectEmpty`(`""`, `[]`) or `rejectBlank`(e.g. `" "`).

### Workflow

https://github.com/jimengio/ts-workflow

### License

MIT
