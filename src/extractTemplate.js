/* this module handles extracting the template.
 *
 */

const fs = require('fs')
const unzip = require('unzipper')
const got = require('got')

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
