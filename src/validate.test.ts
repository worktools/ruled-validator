import { ruledValidate, RuledRules, RuledRuleEntry, registerRuledValidatorRule } from "./validate";

test("required data", () => {
  let requiredRules: RuledRuleEntry = { type: "required", failText: "required" };
  expect(ruledValidate("1", requiredRules)).toBe(undefined);
  expect(ruledValidate(1, requiredRules)).toBe(undefined);
  expect(ruledValidate(null, requiredRules)).toBe("required");
});

test("string", () => {
  let simpleStringRules: RuledRuleEntry = {
    type: "required",
    failText: "required",
    next: [{ type: "string", failText: "not string" }],
  };

  expect(ruledValidate("1", simpleStringRules)).toBe(undefined);
  expect(ruledValidate(null, simpleStringRules)).toBe("required");
  expect(ruledValidate(1, simpleStringRules)).toBe("not string");

  let stringLengthRules: RuledRuleEntry = {
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
  };
  expect(ruledValidate("ww", stringLengthRules)).toBe(undefined);
  expect(ruledValidate("11", stringLengthRules)).toBe("not letters");
  expect(ruledValidate("1", stringLengthRules)).toBe("too short");
  expect(ruledValidate("1234567", stringLengthRules)).toBe("too long");
  expect(ruledValidate("xxX", stringLengthRules)).toBe("X invalid");
});

test("number", () => {
  let numberRules: RuledRuleEntry = {
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
  };
  expect(ruledValidate("1", numberRules)).toBe("not number");
  expect(ruledValidate(1, numberRules)).toBe("too small");
  expect(ruledValidate(11, numberRules)).toBe("too large");
  expect(ruledValidate(7, numberRules)).toBe("cant be 7");

  let numberBound: RuledRuleEntry = {
    type: "number",
    failText: undefined,
    next: [
      { type: "max", n: 10, rejectEqual: true, failText: "too large" },
      { type: "min", n: 5, rejectEqual: true, failText: "too small" },
    ],
  };

  expect(ruledValidate(7, numberBound)).toBe(undefined);
  expect(ruledValidate(5, numberBound)).toBe("too small");
  expect(ruledValidate(10, numberBound)).toBe("too large");
});

test("array", () => {
  let arrayRules: RuledRuleEntry = {
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
  };

  expect(ruledValidate("1", arrayRules)).toBe("not array");
  expect(ruledValidate([1], arrayRules)).toBe("too short");
  expect(ruledValidate([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], arrayRules)).toBe("too long");
  expect(ruledValidate([0, 1, 1, 1, 1, 1, 1], arrayRules)).toBe("first element cant be 0");
});

test("boolean", () => {
  let booleanRules: RuledRuleEntry = {
    type: "required",
    failText: "required",
    next: [{ type: "boolean", failText: "not boolean" }],
  };
  expect(ruledValidate(1, booleanRules)).toBe("not boolean");
  expect(ruledValidate(true, booleanRules)).toBe(undefined);
});

test("object", () => {
  let objectRules: RuledRuleEntry = {
    type: "required",
    failText: "required",
    next: [{ type: "object", failText: "not object" }],
  };

  expect(ruledValidate(1, objectRules)).toBe("not object");
  expect(ruledValidate([], objectRules)).toBe("not object");
  expect(ruledValidate({}, objectRules)).toBe(undefined);
});

test("quick usages", () => {
  expect(ruledValidate("null", { type: "string", failText: "required string" })).toBe(undefined);
  expect(ruledValidate(null, { type: "string", failText: "required string" })).toBe("required string");

  let digitsRules: RuledRuleEntry = { type: "string", failText: "required string", next: [{ type: "regex", regex: /^\d+$/, failText: "not digits" }] };
  expect(ruledValidate("1", digitsRules)).toBe(undefined);
  expect(ruledValidate("1w", digitsRules)).toBe("not digits");

  expect(ruledValidate(1, { type: "number", failText: "required number" })).toBe(undefined);
  expect(ruledValidate(null, { type: "number", failText: "required number" })).toBe("required number");

  expect(ruledValidate(true, { type: "boolean", failText: "required boolean" })).toBe(undefined);
  expect(ruledValidate(null, { type: "boolean", failText: "required boolean" })).toBe("required boolean");

  expect(ruledValidate([true], { type: "array", failText: "required array" })).toBe(undefined);
  expect(ruledValidate(null, { type: "array", failText: "required array" })).toBe("required array");

  expect(ruledValidate({}, { type: "object", failText: "required object" })).toBe(undefined);
  expect(ruledValidate(null, { type: "object", failText: "required object" })).toBe("required object");
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

  let emailRule: RuledRuleEntry = { type: "registered", name: "email", failText: "invalid email" };
  let stringEmailRule: RuledRuleEntry = {
    type: "string",
    failText: "required string",
    next: [{ type: "registered", name: "email", failText: "invalid email" }],
  };

  expect(ruledValidate("x", emailRule)).toBe("invalid email");
  expect(ruledValidate("x@a.b", emailRule)).toBe(undefined);

  expect(ruledValidate(1, stringEmailRule)).toBe("required string");
  expect(ruledValidate("x", stringEmailRule)).toBe("invalid email");
  expect(ruledValidate("x@a.b", stringEmailRule)).toBe(undefined);

  let evenRule: RuledRuleEntry = { type: "number", failText: "required number", next: [{ type: "registered", name: "even-number", failText: "not even" }] };
  expect(ruledValidate(1, evenRule)).toBe("not even");
  expect(ruledValidate(2, evenRule)).toBe(undefined);
});

test("empty string", () => {
  expect(ruledValidate(null, { type: "string", rejectEmpty: false, failText: "empty" })).toBe("empty");
  expect(ruledValidate(null, { type: "string", rejectEmpty: true, failText: "empty" })).toBe("empty");
  expect(ruledValidate(null, { type: "string", rejectBlank: true, failText: "empty" })).toBe("empty");

  expect(ruledValidate("", { type: "string", rejectEmpty: false, failText: "empty" })).toBe(undefined);
  expect(ruledValidate("", { type: "string", rejectEmpty: true, failText: "empty" })).toBe("empty");
  expect(ruledValidate("  ", { type: "string", rejectEmpty: true, failText: "empty" })).toBe(undefined);
  expect(ruledValidate("  ", { type: "string", rejectBlank: true, failText: "empty" })).toBe("empty");
  expect(ruledValidate("1", { type: "string", rejectBlank: true, failText: "empty" })).toBe(undefined);
});

test("empty array", () => {
  expect(ruledValidate(null, { type: "array", rejectEmpty: false, failText: "empty" })).toBe("empty");
  expect(ruledValidate(null, { type: "array", rejectEmpty: true, failText: "empty" })).toBe("empty");

  expect(ruledValidate([], { type: "array", rejectEmpty: false, failText: "empty" })).toBe(undefined);
  expect(ruledValidate([], { type: "array", rejectEmpty: true, failText: "empty" })).toBe("empty");

  expect(ruledValidate([1], { type: "array", rejectEmpty: true, failText: "empty" })).toBe(undefined);
  expect(ruledValidate([undefined], { type: "array", rejectEmpty: true, failText: "empty" })).toBe(undefined);
  expect(ruledValidate([""], { type: "array", rejectEmpty: true, failText: "empty" })).toBe(undefined);
});

test("fail with undefined", () => {
  expect(ruledValidate(null, { type: "string", failText: undefined })).toBe(undefined);
  expect(ruledValidate(1, { type: "string", failText: undefined })).toBe(undefined);
});

test("reject equal", () => {
  expect(ruledValidate(10, { type: "number", failText: undefined, next: [{ type: "max", n: 10, failText: "too large" }] })).toBe(undefined);
  expect(ruledValidate(10, { type: "number", failText: undefined, next: [{ type: "max", n: 10, rejectEqual: true, failText: "too large" }] })).toBe(
    "too large"
  );

  expect(ruledValidate(10, { type: "number", failText: undefined, next: [{ type: "min", n: 10, failText: "too small" }] })).toBe(undefined);
  expect(ruledValidate(10, { type: "number", failText: undefined, next: [{ type: "min", n: 10, rejectEqual: true, failText: "too small" }] })).toBe(
    "too small"
  );
});

test("email", () => {
  let emailRules: RuledRuleEntry = { type: "string", failText: undefined, next: [{ type: "email", failText: "not email" }] };
  expect(ruledValidate("a", emailRules)).toBe("not email");
  expect(ruledValidate("a@c.2", emailRules)).toBe("not email");
  expect(ruledValidate("@qq.com", emailRules)).toBe("not email");

  expect(ruledValidate("a@qq.com", emailRules)).toBe(undefined);
  expect(ruledValidate("a.a@qq.com", emailRules)).toBe(undefined);
  expect(ruledValidate("a-b@qq.com", emailRules)).toBe(undefined);
  expect(ruledValidate("a0@gmail.com", emailRules)).toBe(undefined);
  expect(ruledValidate("a.2@gmail.com", emailRules)).toBe(undefined);
});

test("non chinese", () => {
  let nonChineseRule: RuledRuleEntry = { type: "string", failText: undefined, next: [{ type: "non-chinese", failText: "need ascii" }] };
  expect(ruledValidate("中文", nonChineseRule)).toBe("need ascii");
  expect(ruledValidate("a", nonChineseRule)).toBe(undefined);
  expect(ruledValidate("。", nonChineseRule)).toBe("need ascii");
  expect(ruledValidate("，", nonChineseRule)).toBe("need ascii");
  expect(ruledValidate(",", nonChineseRule)).toBe(undefined);

  let nonChineseButPuncRule: RuledRuleEntry = {
    type: "string",
    failText: undefined,
    next: [{ type: "non-chinese", allowPunctuations: true, failText: "need ascii" }],
  };

  expect(ruledValidate("。", nonChineseButPuncRule)).toBe(undefined);
  expect(ruledValidate("，", nonChineseButPuncRule)).toBe(undefined);
});

test("list of rules", () => {
  let rules: RuledRules = [
    { type: "required", failText: "required" },
    { type: "string", failText: "not string" },
  ];
  expect(ruledValidate(null, rules)).toBe("required");
  expect(ruledValidate(1, rules)).toBe("not string");
  expect(ruledValidate("1", rules)).toBe(undefined);
});
