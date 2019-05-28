import "allocator/arena";

// also you can do this
@external("env", "logf")
declare function logf(id: i32, val: f64): void;

export type NodeId = i32;
export type KeyId = i32;

let _replicas: i32 = 180;
let _keys: i32[] = [];
let _nodes: NodeId[] = [];
let _ring: Map<i32, NodeId> = new Map();


function simpleHash(keyId: i32): i32 {
    return keyId;
}

function compare(v1: i32, v2: i32): i32 {
    if (v1 > v2) {
        return 1;
    } else if (v1 < v2) {
        return -1
    }
    return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
}


export function init(replicas: i32): void {
    _replicas = replicas;
}

export function match(key: KeyId): NodeId | null {
    if (_ring.size === 0) {
        throw new Error("add node before matching");
    }
    let hash = simpleHash(key);
    let pos = getNodePosition(hash);
    return _ring.get(_keys[pos]);
}

export function add(node: NodeId): void {
    _nodes.push(node);
    for (let i = 0; i < _replicas; i++) {
        let number = Math.pow(i, 2) as i32;
        let key = simpleHash(node + number);
        _keys.push(key);
        _ring.set(key, node);
    }
    _keys.sort();
}

export function remove(node: NodeId): void {
    for (let i = 0; i < _nodes.length; i++) {
        if (_nodes[i] == node) {
            _nodes.splice(i, 1);
            i--;
        }
    }

    for (var i = 0; i < _replicas; i++) {
        let number = Math.pow(i, 2) as i32;
        let key = simpleHash(node + number);

        _ring.delete(key);

        for (var j = 0; j < _keys.length; j++) {
            if (_keys[j] == key) {
                _keys.splice(j, 1);
                j--;
            }
        }
    }
}

export function getNodePosition(hash: i32): i32 {
    let upper = _ring.size - 1;
    let lower: i32 = 0;
    let idx: i32 = 0;
    let comp: i32 = 0;
    if (upper === 0) {
        return 0;
    }

    while (lower <= upper) {
        idx = <i32>Math.floor((lower + upper) / 2);
        comp = compare(_keys[idx], hash);

        if (comp === 0) {
            return idx;
        } else if (comp > 0) {
            upper = idx - 1;
        } else {
            lower = idx + 1;
        }
    }

    if (upper < 0) {
        upper = _ring.size - 1;
    }

    return upper;
}
