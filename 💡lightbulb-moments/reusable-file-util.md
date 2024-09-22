# 💡 Light bulb moments

### Reusable file util for getting \_\_dirname from any folder

```ts
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
```

Usually if you extract the file module related utilities
To a dedicated folder/module, things can easily go wrong,
Since `__dirname` and `__filename` refers to the folder
The module is defined regardless of where you run the utility
Due to `pwd` context. The idea came just like that and worked
After couple of mistakes such as not passing `import.meta,url`
As fileURL from the callsite
