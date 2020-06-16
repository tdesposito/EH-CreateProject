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
 * @function extractTemplate Download the "Website" subtree from the template repository
 *
 * @param {string} to - the target directory
 * @param {string} template - the URL of the template repository.
 */
async function extractTemplate (to, template) {
  const url = `${template}/archive/master.zip`
  console.log(`fetching ${url}`)
  const response = await got(url)
  console.log('extracting...')
  const directory = await unzip.Open.buffer(response.rawBody)
  for (e of directory.files) {
    if (e.path.includes('/Website/')) {
      tgt = e.path.split('/').slice(2).join('/')
      if (e.type == 'Directory') {
        if (!fs.existsSync(`${to}/${tgt}`)) {
          fs.mkdirSync(`${to}/${tgt}`)
        }
      } else {
        console.log(`writing ${tgt}`)
        await extractFile(`${to}/${tgt}`, e)
      }
    }
  }
  console.log("done extracting.")
}

async function extractFile(tgt, e) {
  return new Promise( (resolve, reject) => {
    e.stream()
    .pipe(fs.createWriteStream(tgt))
    .on('error', reject)
    .on('finish',resolve)
  })
}

exports.extractTemplate = extractTemplate
