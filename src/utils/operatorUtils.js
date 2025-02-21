
export const operatorPrecedence = {
  '||': 1,
  '&&': 2,
  '==': 3,
  '===': 3,
  '!=': 3,
  '!==': 3,
  '<': 4,
  '>': 4,
  '<=': 4,
  '>=': 4,
  '+': 5,
  '-': 5,
  '*': 6,
  '/': 6
};

export function isOperator(token, precedence) {
  return precedence.hasOwnProperty(token);
}

export function applyOperator(left, operator, right) {
  switch(operator) {
    case '+': return add(left, right);
    case '-': return Number(left) - Number(right);
    case '*': return Number(left) * Number(right);
    case '/': 
      if (Number(right) === 0) throw new Error('Division by zero');
      return Number(left) / Number(right);
    case '==': return left == right;
    case '===': return left === right;
    case '!=': return left != right;
    case '!==': return left !== right;
    case '>': return left > right;
    case '<': return left < right;
    case '>=': return left >= right;
    case '<=': return left <= right;
    case '&&': return left && right;
    case '||': return left || right;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

export function add(a, b) {
  const unquote = (val) => {
    if (typeof val === 'string' && (val.startsWith('"') || val.startsWith("'"))) {
      return val.slice(1, -1);
    }
    return val;
  };

  a = unquote(a);
  b = unquote(b);

  if (typeof a === 'string' || typeof b === 'string') {
    return String(a) + String(b);
  }
  
  return Number(a) + Number(b);
}
