import { ruledValidate, RuledRules, registerRuledValidatorRule } from "./validate";

test("required data", () => {
  let requiredRules: RuledRules = [{ type: "required", failText: "required" }];
  expect(ruledValidate("1", requiredRules)).toBe(undefined);
  expect(ruledValidate(1, requiredRules)).toBe(undefined);
  expect(ruledValidate(null, requiredRules)).toBe("required");
});

test("string", () => {
  let simpleStringRules: RuledRules = [
    {
      type: "required",
      failText: "required",
      next: [{ type: "string", failText: "not string" }],
    },
  ];

  expect(ruledValidate("1", simpleStringRules)).toBe(undefined);
  expect(ruledValidate(null, simpleStringRules)).toBe("required");
  expect(ruledValidate(1, simpleStringRules)).toBe("not string");

  let stringLengthRules: RuledRules = [
    {
      type: "required",
      failText: "required",
      next: [
        {
          type: "string",
          failText: "not string",
          next: [
            { type: "max-length", n: 4, failText: "too long" },
            { type: "min-length", n: 2, failText: "too short" },
            { type: "regex", regex: /^[a-zA-Z]+$/, failText: "not letters" },
            { type: "fn", test: (x) => !x.includes("X"), failText: "X invalid" },
          ],
        },
      ],
    },
  ];
  expect(ruledValidate("ww", stringLengthRules)).toBe(undefined);
  expect(ruledValidate("11", stringLengthRules)).toBe("not letters");
  expect(ruledValidate("1", stringLengthRules)).toBe("too short");
  expect(ruledValidate("1234567", stringLengthRules)).toBe("too long");
  expect(ruledValidate("xxX", stringLengthRules)).toBe("X invalid");
});

test("number", () => {
  let numberRules: RuledRules = [
    {
      type: "required",
      failText: "required",
      next: [
        {
          type: "number",
          failText: "not number",
          next: [
            { type: "max", n: 10, failText: "too large" },
            { type: "min", n: 5, failText: "too small" },
            { type: "fn", test: (x) => x !== 7, failText: "cant be 7" },
          ],
        },
      ],
    },
  ];
  expect(ruledValidate("1", numberRules)).toBe("not number");
  expect(ruledValidate(1, numberRules)).toBe("too small");
  expect(ruledValidate(11, numberRules)).toBe("too large");
  expect(ruledValidate(7, numberRules)).toBe("cant be 7");
});

test("array", () => {
  let arrayRules: RuledRules = [
    {
      type: "required",
      failText: "required",
      next: [
        {
          type: "array",
          failText: "not array",
          next: [
            { type: "max-length", n: 10, failText: "too long" },
            { type: "min-length", n: 5, failText: "too short" },
            { type: "fn", test: (x) => x[0] != 0, failText: "first element cant be 0" },
          ],
        },
      ],
    },
  ];

  expect(ruledValidate("1", arrayRules)).toBe("not array");
  expect(ruledValidate([1], arrayRules)).toBe("too short");
  expect(ruledValidate([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], arrayRules)).toBe("too long");
  expect(ruledValidate([0, 1, 1, 1, 1, 1, 1], arrayRules)).toBe("first element cant be 0");
});

test("boolean", () => {
  let booleanRules: RuledRules = [
    {
      type: "required",
      failText: "required",
      next: [{ type: "boolean", failText: "not boolean" }],
    },
  ];
  expect(ruledValidate(1, booleanRules)).toBe("not boolean");
  expect(ruledValidate(true, booleanRules)).toBe(undefined);
});

test("object", () => {
  let objectRules: RuledRules = [
    {
      type: "required",
      failText: "required",
      next: [{ type: "object", failText: "not object" }],
    },
  ];
  expect(ruledValidate(1, objectRules)).toBe("not object");
  expect(ruledValidate([], objectRules)).toBe("not object");
  expect(ruledValidate({}, objectRules)).toBe(undefined);
});

test("quick usages", () => {
  expect(ruledValidate("null", [{ type: "string", failText: "required string" }])).toBe(undefined);
  expect(ruledValidate(null, [{ type: "string", failText: "required string" }])).toBe("required string");

  let digitsRules: RuledRules = [{ type: "string", failText: "required string", next: [{ type: "regex", regex: /^\d+$/, failText: "not digits" }] }];
  expect(ruledValidate("1", digitsRules)).toBe(undefined);
  expect(ruledValidate("1w", digitsRules)).toBe("not digits");

  expect(ruledValidate(1, [{ type: "number", failText: "required number" }])).toBe(undefined);
  expect(ruledValidate(null, [{ type: "number", failText: "required number" }])).toBe("required number");

  expect(ruledValidate(true, [{ type: "boolean", failText: "required boolean" }])).toBe(undefined);
  expect(ruledValidate(null, [{ type: "boolean", failText: "required boolean" }])).toBe("required boolean");

  expect(ruledValidate([true], [{ type: "array", failText: "required array" }])).toBe(undefined);
  expect(ruledValidate(null, [{ type: "array", failText: "required array" }])).toBe("required array");

  expect(ruledValidate({}, [{ type: "object", failText: "required object" }])).toBe(undefined);
  expect(ruledValidate(null, [{ type: "object", failText: "required object" }])).toBe("required object");
});

test("registered", () => {
  registerRuledValidatorRule("email", (x: string, options) => {
    if (typeof x !== "string") {
      return false;
    }
    return /^\w+@\w+\.\w+$/.test(x);
  });
  registerRuledValidatorRule("even-number", (x: number, options) => {
    if (typeof x !== "number") {
      return false;
    }
    return x % 2 === 0;
  });

  let emailRule: RuledRules = [{ type: "registered", name: "email", failText: "invalid email" }];
  let stringEmailRule: RuledRules = [{ type: "string", failText: "required string", next: [{ type: "registered", name: "email", failText: "invalid email" }] }];

  expect(ruledValidate("x", emailRule)).toBe("invalid email");
  expect(ruledValidate("x@a.b", emailRule)).toBe(undefined);

  expect(ruledValidate(1, stringEmailRule)).toBe("required string");
  expect(ruledValidate("x", stringEmailRule)).toBe("invalid email");
  expect(ruledValidate("x@a.b", stringEmailRule)).toBe(undefined);

  let evenRule: RuledRules = [{ type: "number", failText: "required number", next: [{ type: "registered", name: "even-number", failText: "not even" }] }];
  expect(ruledValidate(1, evenRule)).toBe("not even");
  expect(ruledValidate(2, evenRule)).toBe(undefined);
});
