/// <reference types="node" />
export declare function readFilesFromZip(
  filename: string
): Promise<{
  [filename: string]: Buffer
}>
