import { readFileSync } from 'fs';
import * as path from 'path';

export function readBaseJsonFile(fileName: string) {
  const filePath = path.resolve(process.cwd(), `${fileName}.json`);
  const fileContent = readFileSync(filePath).toString();

  return JSON.parse(fileContent);
}
