# cloudworker-tls-no-crypto

[![CircleCI](https://circleci.com/gh/ArtskydJ/cloudworker-tls-no-crypto.svg?style=svg)](https://circleci.com/gh/ArtskydJ/cloudworker-tls-no-crypto)

[This repo][thisrepo] is based on [@supermari0's repo][smrepo], which is based on [@dollarshaveclub's repo][dscrepo].

----------

Cloudworker allows you to run Cloudflare Worker scripts locally.

## Installing
Install via NPM:
```sh
npm install -g cloudworker-tls-no-crypto
```

## Package Usage
```js
const Cloudworker = require('cloudworker-tls-no-crypto')

const simpleScript = `addEventListener('fetch', event => {
    event.respondWith(new Response('hello', { status: 200 }))
})`

const req = new Cloudworker.Request('https://myfancywebsite.com/someurl')
const cw = new Cloudworker(simpleScript)
cw.dispatch(req).then(res => {
    console.log(`Response Status: ${res.status}`)
    res.text().then(body => {
        console.log(`Response Body: ${body}`)
    })
})
```

## CLI Usage
```sh
Usage: cloudworker [options] <file>

Options:
  -p, --port <port>                   Port (default: 3000)
  -d, --debug                         Debug
  -s, --kv-set [variable.key=value]   Binds variable to a local implementation of Workers KV and sets key to value (default: [])
  -f, --kv-file [variable=path]       Set the filepath for value peristence for the local implementation of Workers KV (default: [])
  -w, --wasm [variable=path]          Binds variable to wasm located at path (default: [])
  -c, --enable-cache                  Enables cache <BETA>
  -r, --watch                         Watch the worker script and restart the worker when changes are detected
  --tls-key <tlsKey>                  Optional. Path to encryption key for serving requests with TLS enabled. Must specify --tls-cert when using this option.
  --tls-cert <tlsCert>                Optional. Path to certificate for serving requests with TLS enabled. Must specify --tls-key when using this option.
  --https-port <httpsPort>            Optional. Port to listen on for HTTPS requests. Must specify --tls-cert and --tls-key when using this option. May not be the same value as --port.
  -h, --help                          output usage information
```

### Simple
```sh
cloudworker example/example.js
curl localhost:3000/
```

```sh
cloudworker --debug example/example.js
curl localhost:3000/
```

### Workers KV
```sh
cloudworker --debug --kv-set KeyValueStore.key=value --kv-set KeyValueStore.hello=world example/example-kv.js
curl localhost:3000/
```

### Workers KV with Persistence
```sh
cloudworker --debug --kv-file KeyValueStore=kv.json --kv-set KeyValueStore.key=value --kv-set KeyValueStore.hello=world example/example-kv.js
curl localhost:3000/
```

### WebAssembly
#### Simple 

```sh
cloudworker --debug --wasm Wasm=example/simple.wasm example/example-wasm-simple.js
curl localhost:3000/
```
[WebAssembly Source](https://github.com/mdn/webassembly-examples/blob/master/js-api-examples/simple.wat)

#### Inverse Square Root
```sh
cloudworker --debug --wasm isqrt=example/isqrt.wasm example/example-wasm-isqrt.js
curl localhost:3000/?num=9
```
[WebAssembly Source](https://developers.cloudflare.com/workers/api/resource-bindings/webassembly-modules/)

#### Resizer 
```sh
cloudworker --debug --wasm RESIZER_WASM=example/resizer.wasm example/example-wasm-resizer.js
curl localhost:3000/wasm-demo/dogdrone.png?width=210 # or open in browser
```
[WebAssembly Source](https://github.com/cloudflare/cloudflare-workers-wasm-demo)


## License
MIT

[thisrepo]: https://github.com/trex-arms/cloudworker-tls-no-crypto
[smrepo]: https://github.com/supermari0/cloudworker/tree/tls-support-upstream
[dscrepo]: https://github.com/dollarshaveclub/cloudworker
