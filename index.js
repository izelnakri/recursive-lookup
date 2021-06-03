import fs from 'fs/promises';
import path from 'path';

export default async function recursiveLookup(folderPath, filter) {
  return await iterToArray(await getFiles(folderPath, filter));
}

async function iterToArray(asyncIter, result = []) {
  for await (const x of asyncIter) {
    result.push(x);
  }

  return result;
}

async function* getFiles(dir, filter = (path) => true) {
  // NOTE: search the diff between, path.resolve, fs.stat
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if ((await fs.stat(res)).isDirectory()) {
      yield* getFiles(res);
    } else {
      if (filter(dirent.name)) {
        yield res;
      }
    }
  }
}
