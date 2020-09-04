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
 * @param {str} runIn - Directory to run in.
 */
async function runNPM(command, runIn) {
  var result = await execa('npm', command.split(' '), {cwd: runIn})
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

  if (params.projectType === 'hybrid') {
    pkg.ehTemplate.frontend = params.frontend
    pkg.ehTemplate.backend = params.backend
  }
  fs.writeFileSync(fname, JSON.stringify(pkg, null, 2))
}


/**
 * @function addDevEnvTask Adds the tasks needed to build the development environment
 *
 * @param {Object} params - Project parameters.
 */

function addDevEnvTask(tasklist, projectType, projectDir, taskDir) {
  switch (projectType) {
    case 'eleventy':
      tasklist.push(
        {
          title: 'Install 11ty',
          task: () => runNPM('install --save-dev @11ty/eleventy', projectDir)
        }
      )
      break
    case 'react':
      tasklist.push(
        {
          title: 'Install React',
          task: () => runNPM('install --save react react-dom react-hot-loader @hot-loader/react-dom', projectDir)
        }
      )
      tasklist.push(
        {
          title: 'Install Webpack',
          task: () => runNPM('install --save-dev webpack webpack-dev-middleware webpack-hot-middleware html-webpack-plugin style-loader css-loader', projectDir)
        }
      )
      tasklist.push(
        {
          title: 'Install Babel',
          task: () => runNPM('install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader', projectDir)
        }
      )
      break
    default:
      break
  }
}
/**
 * @function initDevEnv Creates the tasks needed to build the development environment
 *
 * @param {Object} params - Project parameters.
 * @returns {Object} - a Listr object with the appropriate sub-tasks.
 */
exports.initDevEnv = params => {
  var tasklist = [
    {
      title: 'Install Gulp',
      task: () => runNPM('install', params.projectDir)
    },
  ]

  if (params.projectType === "hybrid") {
    addDevEnvTask(tasklist, params.backend, params.projectDir, `${params.projectDir}/backend`)
    addDevEnvTask(tasklist, params.frontend, params.projectDir, `${params.projectDir}/frontend`)
  } else {
    addDevEnvTask(tasklist, params.projectType, params.projectDir, `${params.projectDir}/site`)
  }
  tasklist.push(
    {
      title: 'Finalize package.json',
      task: () => setTemplateVars(params)
    }
  )
  return new listr(tasklist)
}
