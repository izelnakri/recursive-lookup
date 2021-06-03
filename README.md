# recursive-lookup

Dependency-free and fast async recursive fs lookups in node.js

```js
import recursiveLookup from 'recursive-lookup';

let files = await recursiveLookup('dist', (path) => path.endsWith('.js'));

console.log(files);
```
