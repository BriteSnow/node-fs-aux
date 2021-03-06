import FastGlob, { Options } from 'fast-glob';
import { join } from 'path';

/** 
 * Simplified and sorted glob function (using fast-glob) for one or more pattern from current directory or a optional cwd one. 
 * 
 * Note 1: The result will be sorted by natural directory/subdir/filename order (as a would a recursive walk)
 * Note 2: When `cwd` in options, it is added to the file path i.e. `pathJoin(cwd, path)`
 * 
 * @returns always sorted result return Promise<string[]>
*/
export async function glob(pattern: string | string[], cwdOrFastGlobOptions?: string | Options): Promise<string[]> {
  let opts: Options | undefined = undefined;

  if (cwdOrFastGlobOptions != null) {
    opts = (typeof cwdOrFastGlobOptions === 'string') ? { cwd: cwdOrFastGlobOptions } : cwdOrFastGlobOptions;
  }

  const result = await FastGlob(pattern, opts);
  const cwd = (opts) ? opts.cwd : undefined;
  const list = result.map(path => {
    return (cwd) ? join(cwd, path) : path;
  });
  return list.sort(globCompare);
}


export function globCompare(a: string, b: string) {
  const aPathIdxs = pathIndexes(a);
  const bPathIdxs = pathIndexes(b);
  const minIdx = Math.min(aPathIdxs.length, bPathIdxs.length) - 1;
  const aMinPath = a.substring(0, aPathIdxs[minIdx]);
  const bMinPath = b.substring(0, bPathIdxs[minIdx]);

  // if the common path is the same, and the path depth is different, then, the shortest one come first;
  if ((aMinPath === bMinPath) && (aPathIdxs.length !== bPathIdxs.length)) {
    return (aPathIdxs.length < bPathIdxs.length) ? -1 : 1;
  }

  // otherwise, we do a normal compare
  return (a < b) ? -1 : 1;
}

function pathIndexes(fullPath: string): number[] {
  const idxs: number[] = [];

  const l = fullPath.length;
  for (let i = 0; i < l; i++) {
    if (fullPath[i] === '/') {
      idxs.push(i);
    }
  }

  return idxs;
}