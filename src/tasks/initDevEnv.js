/**
 * @file Creates either an S3- or ElasticBeanstalk-based hosting environment
 *
 * Part of the create-ehproject tool.
 *
 * @author Todd D. Esposito <todd@espositoholdings.com>
 * @copyright Copyright 2020 Todd D. Esposito.
 * @license Released under the MIT license.
 */

const fs = require('fs')

const execa = require('execa')
const listr = require('listr')

/**
 * @function runNPM Executes an NPM command.
 *
 * @param {str} command - command for npm to run.
 * @param {Object} params - Project parameters.
 */
async function runNPM(command, params) {
  var result = await execa('npm', command.split(' '), {cwd: params.projectDir})
  // TODO: handle error returns, etc.
}


/**
 * @function setTemplateVars Update package.json with ehTemplate parameters.
 *
 * @param {Object} params - Project parameters.
 */
function setTemplateVars(params) {
  const fname = `${params.projectDir}/package.json`
  var pkg = JSON.parse(fs.readFileSync(fname, 'utf8'))
  pkg.ehTemplate.environments.alpha = params.alphaConfig
  pkg.ehTemplate.environments.production = params.prodConfig
  pkg.ehTemplate.awsProfileName = params.profile
  fs.writeFileSync(fname, JSON.stringify(pkg, null, 2))
}


/**
 * @function initDevEnv Creates the tasks needed to build the development environment
 *
 * @param {Object} params - Project parameters.
 * @returns {Object} - a Listr object with the appropriate sub-tasks.
 */
function initDevEnv(params) {
  var tasklist = [
    {
      title: 'Install Tooling (will take some time)',
      task: () => runNPM('install', params)
    },
  ]
  switch (params.projectType) {
    case 'eleventy':
      tasklist.push(
        {
          title: 'Install 11ty',
          task: () => runNPM('install --save-dev @11ty/eleventy', params)
        }
      )
      break
    default:
      break
  }
  tasklist.push(
    {
      title: 'Finalize package.json',
      task: () => setTemplateVars(params)
    }
  )
  return new listr(tasklist)
}


exports.initDevEnv = initDevEnv
