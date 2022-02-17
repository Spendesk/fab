import chokidar from 'chokidar'
export declare const watcher: (
  dirs: string[] | undefined,
  fn: () => Promise<void>,
  options?: chokidar.WatchOptions | undefined
) => Promise<void>
