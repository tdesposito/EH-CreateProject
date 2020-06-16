/**
 * @file Update template files with project details
 *
 * Part of the create-ehproject tool.
 *
 * @author Todd D. Esposito <todd@espositoholdings.com>
 * @copyright Copyright 2020 Todd D. Esposito.
 * @license Released under the MIT license.
 */

const fs = require('fs')
const path = require('path')


/**
 * @function updateTemplateFile Update a single template file.
 *
 * @param {string} name - file to update
 * @param {Object} regexs - list of RegExp to apply
 */
function updateTemplateFile(name, regexs) {
  var original = fs.readFileSync(name, {encoding: 'utf8', flag:'r'}).toString('utf-8')
  var revised = regexs.reduce((s, re) => {
    return s.replace(re[0], re[1])
  }, original)
  if (revised !== original) {
    console.log(`updating ${name}`)
    fs.writeFileSync(name, revised)
  }
}


/**
 * @function walkTemplate Walk the template, updating files.
 *
 * @param {string} dir - base directory to update
 * @param {list} regexs - list of RegExp to apply
 */
 function walkTemplate(dir, regexs) {
   fs.readdirSync(dir, {withFileTypes: true}).forEach( ent => {
     const target = path.join(dir, ent.name)
     if (ent.isDirectory()) {
       walkTemplate(target, regexs)
     } else if (ent.name !== 'package.json') {
       updateTemplateFile(target, regexs)
     }
   })
 }


/**
 * @function updateTemplate Update the template with project details
 *
 * @param {string} dir - base directory to update
 * @param {Object} params - keys/values to update
 */
function updateTemplate(dir, params) {
    var regexs = []
    for (const [key, value] of Object.entries(params)) {
      regexs.push([new RegExp(`\{\{${key}\}\}`, 'g'), value])
    }
    walkTemplate(dir, regexs)
  }
exports.updateTemplate = updateTemplate
