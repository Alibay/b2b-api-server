export function hashify(object: any, prefix: string) {
  return Object.keys(object)
    .sort()
    .reduce(
      (hash, key) => {
        const strVal = isObject(object[key]) ? hashify(object[key], '') : object[key];
        hash.push(`${key}-${strVal}`);
        return hash;
      },
      [prefix],
    )
    .join(':');
}

function isObject(src: any) {
  return typeof src === 'object' && src !== null;
}
