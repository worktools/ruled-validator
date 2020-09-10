interface RuledRequired {
  type: "required";
  failText: string;
  next?: (RuledString | RuledArray | RuledBoolean | RuledNumber | RuledObject | RuledByFn)[];
}

interface RuledString {
  type: "string";
  rejectEmpty?: boolean;
  rejectBlank?: boolean;
  failText: string;
  next?: (RuledStringMinLength | RuledStringMaxLength | RuledStringRegex | RuledRegistered | RuledStringEmail | RuledStringNonChinese | RuledByFn<string>)[];
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

interface RuledStringNonChinese {
  type: "non-chinese";
  allowPunctuations?: boolean;
  failText: string;
}

interface RuledStringEmail {
  type: "email";
  failText: string;
}

interface RuledArray {
  type: "array";
  rejectEmpty?: boolean;
  failText: string;
  next?: (RuledArrayMaxLength | RuledArrayMinLength | RuledRegistered | RuledByFn<any[]>)[];
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
  rejectEqual?: boolean;
  failText: string;
}

interface RuledNumberMin {
  type: "min";
  n: number;
  rejectEqual?: boolean;
  failText: string;
}

interface RuledNumber {
  type: "number";
  failText: string;
  next?: (RuledNumberMax | RuledNumberMin | RuledRegistered | RuledByFn<number>)[];
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

interface RuledRegistered {
  type: "registered";
  name: string;
  options?: any;
  failText: string;
}

export type RuledRules = (RuledRequired | RuledByFn | RuledString | RuledNumber | RuledBoolean | RuledArray | RuledObject | RuledRegistered)[];

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

// https://stackoverflow.com/a/46181/883571
let emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

let ruledValidateStringEmail = (x: string, rule: RuledStringEmail): string => {
  if (!emailPattern.test(x)) {
    return rule.failText;
  }
};

// https://stackoverflow.com/a/21113538/883571
let chinesePattern = /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/;
let chinesePuncPattern = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;

let ruledValidateStringNonChinese = (x: string, rule: RuledStringNonChinese): string => {
  if (chinesePattern.test(x)) {
    return rule.failText;
  }
  if (chinesePuncPattern.test(x)) {
    if (rule.allowPunctuations !== true) {
      return rule.failText;
    }
  }
};

let ruledValidateString = (x: any, rule: RuledString): string => {
  if (typeof x !== "string") {
    return rule.failText;
  }
  if (rule.rejectEmpty) {
    if (x === "") {
      return rule.failText;
    }
  }
  if (rule.rejectBlank) {
    if (x.trim() === "") {
      return rule.failText;
    }
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
        case "non-chinese": {
          let result = ruledValidateStringNonChinese(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "email": {
          let result = ruledValidateStringEmail(x, childRule);
          if (result != null) {
            return result;
          }
          break;
        }
        case "registered": {
          let result = ruledValidateRegistered(x, childRule);
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
  if (rule.rejectEqual) {
    if (x === rule.n) {
      return rule.failText;
    }
  }
};

let ruledValidateNumberMin = (x: number, rule: RuledNumberMin): string => {
  if (x < rule.n) {
    return rule.failText;
  }
  if (rule.rejectEqual) {
    if (x === rule.n) {
      return rule.failText;
    }
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
        case "registered": {
          let result = ruledValidateRegistered(x, childRule);
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
  if (rule.rejectEmpty) {
    if (x.length === 0) {
      return rule.failText;
    }
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
        case "registered": {
          let result = ruledValidateRegistered(x, childRule);
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

let ruledValidateRegistered = (x: any, rule: RuledRegistered): string => {
  let f = registeredRules[rule.name];
  if (f == null) {
    console.warn("Rule", rule);
    throw new Error(`Unknown registered rule: ${rule.name}`);
  }
  let result = f(x, rule.options);
  if (!result) {
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
      case "registered": {
        let result = ruledValidateRegistered(x, rule);
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

let registeredRules: Record<string, (x: any, options: object) => boolean> = {};

export let registerRuledValidatorRule = (name: string, f: (x: any, options: object) => boolean) => {
  if (registeredRules[name] != null) {
    console.warn("Overwriting rule", name, f);
  }
  registeredRules[name] = f;
};
