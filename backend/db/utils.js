//convert neo4j properties to native js types
export function toNative(properties) {
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
  } else if (isInt(value)) {
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
