/**
 * @file Extract the "Website" subtree from the template repository.
 *
 * Part of the create-ehproject tool.
 *
 * @author Todd D. Esposito <todd@espositoholdings.com>
 * @copyright Copyright 2020 Todd D. Esposito.
 * @license Released under the MIT license.
 */

const fs = require('fs')
const unzip = require('unzipper')
const got = require('got')

/**
 * @function extractTemplate Extract the template into the local project
 *
 * @param {string} template - the URL of the template repository.
 * @param {string} to - the target directory
 */
async function extractTemplate (params) {
  var to = params.projectDir
  var frontend = params.frontend || params.projectType
  var backend = params.backend || 'NONE'
  var fe_dir = params.frontend ? 'frontend' : 'site'

  const url = `${params.templateURL}/archive/master.zip`
  const response = await got(url)
  const directory = await unzip.Open.buffer(response.rawBody)

  for (e of directory.files) {
    var parts = e.path.split('/')
    var section = parts[1]
    if (section === 'All' || section === `Hosting-${params.projectHosting}`) {
      await extractFile(e, `${to}/${parts.slice(2).join('/')}`)
    } else if (section === `Type-${frontend}`) {
      if (parts[2] === 'site') {
        parts[2] = fe_dir
      }
      await extractFile(e, `${to}/${parts.slice(2).join('/')}`)
    } else if (section === `Type-${backend}`) {
      if (parts[2] === 'site') {
        parts[2] = 'backend'
      }
      await extractFile(e, `${to}/${parts.slice(2).join('/')}`)
    }
  }
  return("Template extracted.")
}
exports.extractTemplate = extractTemplate


async function extractFile(e, tgt) {
  if (e.type === 'Directory') {
    if (!fs.existsSync(tgt)) {
      fs.mkdirSync(tgt)
    }
    return () => new Promise.resolve()
  }
  return new Promise( (resolve, reject) => {
    e.stream()
    .pipe(fs.createWriteStream(tgt))
    .on('error', reject)
    .on('finish', resolve)
  })
}
