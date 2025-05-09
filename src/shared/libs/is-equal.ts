type PlainObject<T = any> =
  | {
      [k in string]: T
    }
  | any

// Функция, которая проверяет, что это точно объект
function isPlainObject(value: unknown): value is PlainObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.constructor === Object &&
    Object.prototype.toString.call(value) === '[object Object]'
  )
}

function isArray(value: unknown): value is [] {
  return Array.isArray(value)
}

function isArrayOrObject(value: unknown): value is [] | PlainObject {
  return isPlainObject(value) || isArray(value)
}

export function isEqual(lhs: PlainObject, rhs: PlainObject) {
  if (lhs === null || rhs === null) {
    return lhs === rhs
  }

  if (typeof lhs !== 'object' && typeof rhs !== 'object') {
    return lhs === rhs
  }

  if (Object.keys(lhs).length !== Object.keys(rhs).length) {
    return false
  }

  for (const [key, value] of Object.entries(lhs)) {
    const rightValue = rhs[key]

    if (isArrayOrObject(value) && isArrayOrObject(rightValue)) {
      if (isEqual(value, rightValue)) {
        continue
      }
      return false
    }

    if (value !== rightValue) {
      return false
    }
  }

  return true
}
