export function firstWord(str: string) {
  const spaceIdx = str.indexOf(' ');
  return spaceIdx === -1 ? str : str.substring(0, spaceIdx);
}

export function withoutFirstWord(str: string) {
  const spaceIdx = str.indexOf(' ');
  return spaceIdx === -1 ? '' : str.substring(spaceIdx + 1);
}

export function capitalize<T extends string>(str: T): Capitalize<T> {
  return `${str[0].toUpperCase()}${str.substring(1)}` as Capitalize<T>;
}
