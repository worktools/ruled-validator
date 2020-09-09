## Ruled Validator

> Type-friendly JSON based validator engine like https://ant.design/components/form/#Rule

### Usage

![](https://img.shields.io/npm/v/@jimengio/ruled-validator.svg?style=flat-square)

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

ruledValidate("1", stringLengthRules); // string | undefined
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

### Workflow

https://github.com/jimengio/ts-workflow

### License

MIT
