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
    console.log("Delete key", nodeIds[0]);
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
