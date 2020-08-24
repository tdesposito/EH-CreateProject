/**
 * @file Builds the Listr-based task runner
 *
 * Part of the create-ehproject tool.
 *
 * @author Todd D. Esposito <todd@espositoholdings.com>
 * @copyright Copyright 2020 Todd D. Esposito.
 * @license Released under the MIT license.
 */

const execa = require('execa')
const listr = require('listr')

const {updateAWSConfig} = require('./tasks/updateAWSConfig')
const {extractTemplate} = require('./tasks/extractTemplate')
const {updateTemplate} = require('./tasks/updateTemplate')
const {initHostingEnv} = require('./tasks/initHostingEnv')
const {initDevEnv} = require('./tasks/initDevEnv')

/**
 * @function buildTasklist Builds the Listr-based task runner
 *
 * @param {Object} params - Project parameters.
 */
 exports.buildTasklist = params => {
  return new listr([
    {
      title: 'Update local AWS CLI configuration',
      skip: () => !(params.roleARN),
      task: () => updateAWSConfig(params.profile, params.roleARN)
    },
    {
      title: 'Create remote repository',
      skip: () => !(params.initRepo),
      task: () => execa('aws', ['codecommit', 'create-repository',
                          '--profile', params.profile,
                          '--repository-name',  `${params.projectName}-Website`,
                          '--repository-description', 'Source code for your website resides here.']),
    },
    {
      title: 'Clone remote repository',
      skip: () => !(params.initRepo),
      task: () => execa('git', ['clone', params.repoURL, params.projectDir])
    },
    {
      title: 'Construct local project directory',
      task: () => {
        return new listr([
          {
            title: 'Download and extract the template',
            task: () => extractTemplate(params)
          },
          {
            title: 'Configure the project',
            task: () => updateTemplate(params.projectDir, params)
          },
        ])
      }
    },
    {
      title: 'Initialize hosting environment',
      skip: () => !(params.initHosting),
      task: () => initHostingEnv(params)
    },
    {
      title: 'Initializing development environment',
      skip: () => !(params.initDev),
      task: () => initDevEnv(params)
    },
  ])
}
