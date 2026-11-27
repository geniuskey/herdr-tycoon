globalThis.localStorage = { getItem: () => null, setItem: () => {} }
globalThis.Audio = class { play() { return Promise.resolve() } }
