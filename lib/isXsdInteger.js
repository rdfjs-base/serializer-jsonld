function isXsdInteger (object) {
  return object.datatype &&
    isXsdIntegerType(object.datatype) &&
    isIntegerValue(object.value)
}

function isXsdIntegerType (datatype) {
  return datatype.value === 'http://www.w3.org/2001/XMLSchema#integer'
}

function isIntegerValue (value) {
  return !isNaN(value) && parseInt(value, 10).toFixed(0) === value
}

module.exports = isXsdInteger
