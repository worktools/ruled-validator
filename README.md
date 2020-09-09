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

### Workflow

https://github.com/jimengio/ts-workflow

### License

MIT
