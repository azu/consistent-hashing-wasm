# consistent-hashing-wasm [![Build Status](https://travis-ci.org/azu/consistent-hashing-wasm.svg?branch=master)](https://travis-ci.org/azu/consistent-hashing-wasm)


[Consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing) algorithm written by AssemblyScript.

It is based on [dakatsuka/node-consistent-hashing: A pure JavaScript implementation of Consistent Hashing](https://github.com/dakatsuka/node-consistent-hashing) implementation.

## Install

    yarn install
    yarn run build

## Usage

Example

    yarn test

```js
(async () => {
    const assert = require("assert");
    const fs = require("fs");
    const compiled = new WebAssembly.Module(fs.readFileSync(__dirname + "/../build/untouched.wasm"));
    const imports = {
        env: {
            memoryBase: 1000,
            tableBase: 1000,
            // import as @external("env", "logf")
            logf(id, value) {
                console.log(id + " | " + value);
            },
            abort(msg, file, line, column) {
                console.error("abort called at main.ts:" + line + ":" + column);
            }
        }
    };
    const res = await WebAssembly.instantiate(compiled, imports);
    const consistentHashing = res.exports;
    // node id for registration
    const nodeIds = Array.from(Array(10), (_, i) => i);
    // _replicas space
    consistentHashing.init(128);
    nodeIds.forEach(nodeId => {
        consistentHashing.add(nodeId);
    });
    const nodeIdByNameMap = new Map();
    const nameIds = [1, 2, 10, 30, 50, 55, 77, 100, 128, 222, 223,4444]
    nameIds.forEach(name => {
        const node = consistentHashing.match(name);
        const array = nodeIdByNameMap.get(node)
        if (array) {
            nodeIdByNameMap.set(node, array.concat(name));
        } else {
            nodeIdByNameMap.set(node, [name]);
        }
    })
    console.log(nodeIdByNameMap);
    /*
    Map {
      1 => [ 1, 50 ],
      2 => [ 2 ],
      9 => [ 10, 77, 222, 223, 4444 ],
      5 => [ 30 ],
      6 => [ 55 ],
      0 => [ 100 ],
      7 => [ 128 ]
    }
    */
    // remove
    consistentHashing.remove(nodeIds[0]);
    // remap
    const reNodeIdByNameMap = new Map();
    nameIds.forEach(name => {
        const node = consistentHashing.match(name);
        const array = reNodeIdByNameMap.get(node)
        if (array) {
            reNodeIdByNameMap.set(node, array.concat(name));
        } else {
            reNodeIdByNameMap.set(node, [name]);
        }
    });
    console.log(reNodeIdByNameMap);
    /*
    Map {
      1 => [ 1, 50 ],
      2 => [ 2 ],
      9 => [ 10, 77, 100, 222, 223, 4444 ],
      5 => [ 30 ],
      6 => [ 55 ],
      7 => [ 128 ]
    }
     */
})();
```

## Changelog

See [Releases page](https://github.com/azu/consistent-hashing-wasm/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/consistent-hashing-wasm/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
