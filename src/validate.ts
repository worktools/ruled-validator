interface RuledRequired {
  type: "required";
  failText: string;
  next?: (RuledString | RuledArray | RuledBoolean | RuledNumber | RuledObject | RuledByFn)[];
}

interface RuledString {
  type: "string";
  failText: string;
  next?: (RuledStringMinLength | RuledStringMaxLength | RuledStringRegex | RuledByFn<string>)[];
}

interface RuledStringMaxLength {
  type: "max-length";
  n: number;
  failText: string;
}

interface RuledStringMinLength {
  type: "min-length";
  n: number;
  failText: string;
}

interface RuledStringRegex {
  type: "regex";
  regex: RegExp;
  failText: string;
}

interface RuledArray {
  type: "array";
  failText: string;
  next?: (RuledArrayMaxLength | RuledArrayMinLength | RuledByFn<any[]>)[];
}

interface RuledArrayMaxLength {
  type: "max-length";
  n: number;
  failText: string;
}

interface RuledArrayMinLength {
  type: "min-length";
  n: number;
  failText: string;
}

interface RuledBoolean {
  type: "boolean";
  failText: string;
}

interface RuledNumberMax {
  type: "max";
  n: number;
  failText: string;
}

interface RuledNumberMin {
  type: "min";
  n: number;
  failText: string;
}

interface RuledNumber {
  type: "number";
  failText: string;
  next?: (RuledNumberMax | RuledNumberMin | RuledByFn<number>)[];
}

interface RuledObject {
  type: "object";
  failText: string;
  next?: RuledByFn<object>[];
}

interface RuledByFn<T = any> {
  type: "fn";
  test: (x: T) => boolean;
  failText: string;
}

export type RuledRules = (RuledRequired | RuledByFn | RuledString | RuledNumber | RuledBoolean | RuledArray | RuledObject)[];

let ruledValidateStringMaxLength = (x: string, rule: RuledStringMaxLength): string => {
  if (x.length > rule.n) {
    return rule.failText;
  }
};
let ruledValidateStringMinLength = (x: string, rule: RuledStringMinLength): string => {
  if (x.length < rule.n) {
    return rule.failText;
  }
};

let ruledValidateStringRegex = (x: string, rule: RuledStringRegex): string => {
  if (!rule.regex.test(x)) {
    return rule.failText;
  }
};

let ruledValidateString = (x: any, rule: RuledString): string => {
  if (typeof x !== "string") {
    return rule.failText;
  }
  if (rule.next != null) {
    for (let idx in rule.next) {
      let childRule = rule.next[idx];
      switch (childRule.type) {
        case "max-length": {
          let result = ruledValidateStringMaxLength(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "min-length": {
          let result = ruledValidateStringMinLength(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "regex": {
          let result = ruledValidateStringRegex(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "fn": {
          let result = ruledValidateFn(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        default:
          console.warn("Rule", childRule);
          throw new Error("Unknown rule");
      }
    }
  }
};

let ruledValidateNumberMax = (x: number, rule: RuledNumberMax): string => {
  if (x > rule.n) {
    return rule.failText;
  }
};

let ruledValidateNumberMin = (x: number, rule: RuledNumberMin): string => {
  if (x < rule.n) {
    return rule.failText;
  }
};
let ruledValidateNumber = (x: string, rule: RuledNumber): string => {
  if (typeof x !== "number") {
    return rule.failText;
  }
  if (rule.next != null) {
    for (let idx in rule.next) {
      let childRule = rule.next[idx];
      switch (childRule.type) {
        case "max": {
          let result = ruledValidateNumberMax(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "min": {
          let result = ruledValidateNumberMin(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "fn": {
          let result = ruledValidateFn(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        default:
          console.warn("Rule", childRule);
          throw new Error("Unknown rule");
      }
    }
  }
};

let ruledValidateArrayMaxLength = (x: any[], rule: RuledArrayMaxLength): string => {
  if (x.length > rule.n) {
    return rule.failText;
  }
};

let ruledValidateArrayMinLength = (x: any[], rule: RuledArrayMinLength): string => {
  if (x.length < rule.n) {
    return rule.failText;
  }
};

let ruledValidateArray = (x: string, rule: RuledArray): string => {
  if (!Array.isArray(x)) {
    return rule.failText;
  }
  if (rule.next != null) {
    for (let idx in rule.next) {
      let childRule = rule.next[idx];
      switch (childRule.type) {
        case "max-length": {
          let result = ruledValidateArrayMaxLength(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "min-length": {
          let result = ruledValidateArrayMinLength(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "fn": {
          let result = ruledValidateFn(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        default:
          console.warn("Rule", childRule);
          throw new Error("Unknown rule");
      }
    }
  }
};

let ruledValidateBoolean = (x: string, rule: RuledBoolean): string => {
  if (typeof x !== "boolean") {
    return rule.failText;
  }
};

let ruledValidateObject = (x: string, rule: RuledObject): string => {
  if (x == null) {
    return rule.failText;
  }
  if (typeof x !== "object" || Array.isArray(x)) {
    return rule.failText;
  }
  if (rule.next != null) {
    for (let idx in rule.next) {
      let childRule = rule.next[idx];
      switch (childRule.type) {
        case "fn": {
          let result = ruledValidateFn(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        default:
          console.warn("Rule", childRule);
          throw new Error("Unknown rule");
      }
    }
  }
};

let ruledValidateRequired = (x: any, rule: RuledRequired): string => {
  if (x == null) {
    return rule.failText;
  }
  if (rule.next != null) {
    for (let idx in rule.next) {
      let childRule = rule.next[idx];
      switch (childRule.type) {
        case "string": {
          let result = ruledValidateString(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "number": {
          let result = ruledValidateNumber(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "array": {
          let result = ruledValidateArray(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "boolean": {
          let result = ruledValidateBoolean(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "object": {
          let result = ruledValidateObject(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        default: {
          console.warn("Rule", childRule);
          throw new Error("Unknown rule");
        }
      }
    }
  }
};

let ruledValidateFn = (x: any, rule: RuledByFn): string => {
  if (!rule.test(x)) {
    return rule.failText;
  }
};

export let ruledValidate = (x: any, rules: RuledRules) => {
  for (let idx in rules) {
    let rule = rules[idx];
    switch (rule.type) {
      case "required": {
        let result = ruledValidateRequired(x, rule);
        if (result != null) {
          return result;
        }
        break;
      }
      case "array": {
        let result = ruledValidateArray(x, rule);
        if (result != null) {
          return result;
        }
        break;
      }
      case "number": {
        let result = ruledValidateNumber(x, rule);
        if (result != null) {
          return result;
        }
        break;
      }
      case "string": {
        let result = ruledValidateString(x, rule);
        if (result != null) {
          return result;
        }
        break;
      }
      case "object": {
        let result = ruledValidateObject(x, rule);
        if (result != null) {
          return result;
        }
        break;
      }
      case "boolean": {
        let result = ruledValidateBoolean(x, rule);
        if (result != null) {
          return result;
        }
        break;
      }
      case "fn": {
        let result = ruledValidateFn(x, rule);
        if (result != null) {
          return result;
        }
        break;
      }
      default:
        console.warn("Rule", rule);
        throw new Error("Unknown rule");
    }
  }
};

let rule: RuledRequired = {
  type: "required",
  failText: "TODO",
  next: [
    {
      type: "string",
      failText: "TODO",
      next: [
        { type: "min-length", n: 2, failText: "TODO" },
        { type: "max-length", n: 4, failText: "TODO" },
        { type: "regex", regex: /\d+/, failText: "TODO" },
      ],
    },
  ],
};
