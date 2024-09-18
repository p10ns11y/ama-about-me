type Options = {
  fileURL: string;
};
export async function getDirectoryName({ fileURL }: Options) {
  let path = await import('node:path');
  let { dirname } = path;

  let { fileURLToPath } = await import('node:url');

  let __dirname = dirname(fileURLToPath(fileURL));

  return __dirname;
}
