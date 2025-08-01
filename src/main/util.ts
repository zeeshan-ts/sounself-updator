/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

interface Substitutions {
  [key: string]: string;
}

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function applySubstitutions(
  text: string,
  substitutions: Substitutions,
): string {
  return Object.entries(substitutions).reduce((result, [key, value]) => {
    const regexp = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    return result.replace(regexp, value);
  }, text);
}
