#!/usr/bin/env node

const program = require('commander')
const Cloudworker = require('../cloudworker')
const fs = require('fs')
const path = require('path')

let file = null

function collect (val, memo) {
  memo.push(val)
  return memo
}

program
  .usage('[options] <file>')
  .option('--tls-key <tlsKey>', 'Optional. Path to encryption key for serving requests with TLS enabled. Must specify --tls-cert when using this option.')
  .option('--tls-cert <tlsCert>', 'Optional. Path to certificate for serving requests with TLS enabled. Must specify --tls-key when using this option.')
  .option('--https-port <httpsPort>', 'Optional. Port to listen on for HTTPS requests. Must specify --tls-cert and --tls-key when using this option. May not be the same value as --port.', 3001)
  .action(f => { file = f })
  .parse(process.argv)

if (typeof file !== 'string') {
  console.error('no file specified')
  process.exit(1)
}

run(file)

function run (file) {
  console.log('Starting up...')
  const fullpath = path.resolve(process.cwd(), file)
  const script = fs.readFileSync(fullpath).toString('utf-8')

  if ((program.tlsKey && !program.tlsCert) || (!program.tlsKey && program.tlsCert)) {
    console.error('Both --tls-key and --tls-cert must be set when using TLS.')
    process.exit(1)
  }

  let tlsKey = ''
  let tlsCert = ''
  if (program.tlsKey && program.tlsCert) {
    try {
      tlsKey = fs.readFileSync(program.tlsKey)
      tlsCert = fs.readFileSync(program.tlsCert)
    } catch (err) {
      console.error('Error reading TLS configuration')
      console.error(err)
      process.exit(1)
    }
    if (program.port === program.httpsPort) {
      console.error('HTTP port and HTTPS port must be different')
      process.exit(1)
    }
  }

  const opts = {
    debug: program.debug,
    enableCache: program.enableCache,
    tlsKey: tlsKey,
    tlsCert: tlsCert,
  }
  let worker = new Cloudworker(script, opts)
  let server = worker.listen(program.port)
  console.log(`Listening on ${program.port} for HTTP requests`)

  let httpsServer = null
  if (tlsKey && tlsCert) {
    httpsServer = worker.httpsListen(program.httpsPort)
    console.log(`Listening on ${program.httpsPort} for HTTPS requests`)
  }

  let stopping = false
  let reloading = false

  if (program.watch) {
    fs.watchFile(fullpath, () => {
      reloading = true
      console.log('Changes to the worker script detected - reloading...')

      server.close(() => {
        if (stopping) {
          if (httpsServer) {
            httpsServer.close(() => { })
          }
          return
        }

        worker = new Cloudworker(utils.read(fullpath), opts)
        server = worker.listen(program.port)

        if (httpsServer) {
          httpsServer.close(() => {
            httpsServer = worker.httpsListen(program.httpsPort)
          })
        }
        reloading = false
        console.log('Successfully reloaded server!')
      })
    })
  }

  function shutdown () {
    if (stopping) return

    stopping = true
    console.log('\nShutting down...')
    server.close(terminate)
    if (httpsServer) {
      httpsServer.close(terminate)
    }

    if (reloading) {
      server.on('close', terminate)
      if (httpsServer) {
        httpsServer.on('close', terminate)
      }
    }
  }

  function terminate () {
    console.log('Goodbye!')
    process.exit(0)
  }

  process.on('SIGINT', () => {
    shutdown()
  })

  process.on('SIGTERM', () => {
    shutdown()
  })
}