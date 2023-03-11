//convert neo4j properties to native js types
function toNative(properties) {
  return Object.fromEntries(
    Object.keys(properties).map(key => {
      let value = valueToNative(properties[key]);

      return [key, value];
    })
  );
}

function valueToNative(value) {
  if (Array.isArray(value)) {
    value = value.map(val => valueToNative(value));
  } else if ((value)) {
    value = value.toNumber();
  } else if (
    isDate(value) ||
    isDateTime(value) ||
    isTime(value) ||
    isLocalDateTime(value) ||
    isLocalTime(value) ||
    isDuration(value)
  ) {
    value = value.toString();
  } else if (
    typeof value === "object" &&
    value !== undefined &&
    value !== null
  ) {
    value = toNativeTypes(value);
  }

  return value;
}

function parseNeo(records) {
  console.log(Array.isArray(records));
  if(Array.isArray(records)) {
    records = records.map(({keys, _fields, _fieldLookup}) => {
      let parsed = {};
      for(let key of keys) {
        parsed[key] = _fields[_fieldLookup[key]];
      }
      return parsed;
    })
    return records;

  }
}

module.exports = parseNeo;