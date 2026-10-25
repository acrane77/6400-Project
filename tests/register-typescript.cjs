const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

const projectRoot = path.resolve(__dirname, '..')
const originalResolveFilename = Module._resolveFilename

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    if (request === '@/lib/firebaseAdmin') {
      request = path.join(projectRoot, 'tests/mocks/firebaseAdmin.cjs')
    } else {
    request = path.join(projectRoot, request.slice(2))
    }
  }

  return originalResolveFilename.call(this, request, parent, isMain, options)
}

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  })

  module._compile(outputText, filename)
}
