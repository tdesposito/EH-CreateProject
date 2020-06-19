/**
 * @file Builds the Listr-based task runner
 *
 * Part of the create-ehproject tool.
 *
 * @author Todd D. Esposito <todd@espositoholdings.com>
 * @copyright Copyright 2020 Todd D. Esposito.
 * @license Released under the MIT license.
 */

const listr = require('listr')
// const execa = require('execa')
// const {Observable} = require('rxjs')

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
function buildTasklist(params) {
  return new listr([
    { // update aws cfg
      title: 'Update local AWS CLI configuration',
      skip: () => !(params.roleARN),
      task: () => updateAWSConfig(params.profile, params.roleARN)
    },
    { // construct template
      title: 'Construct template',
      task: () => {
        return new listr([
          {
            title: 'Download the template',
            task: () => extractTemplate(params.projectDir, params.templateURL)
          },
          {
            title: 'Configure the tempate',
            task: () => updateTemplate(params.projectDir, params)
          },
        ])
      }
    },
    { // init hosting env
      title: 'Initialize Hosting Environment',
      // skip: () => true, // FIXME: just for testing!
      task: () => initHostingEnv(params)
    },
    { // init dev env
      title: 'Initializing Development Environment',
      task: () => initDevEnv(params)
    },
  ])
}
    // {
    //   title: 'Creating Code Repository',
    //   skip: true,
    //   task: () => {
    //     return new Observable(observer => {
    //       observer.next('Create CodeCommit Repository')
    //       // -- aws codecommit create-repository --repository-name ${params.projectName}-Website --repository-description "Your source code for your website resides here."
    //       () => execa('aws', ['codecommit', 'create-repository',
    //                     `--repository-name ${params.projectName}-Website`,
    //                     '--repository-description', '"Your source code for your website resides here."'
    //                   ]).then(result => {
    //                     if (result !== '0') {
    //                       throw new Error('Could not create repository')
    //                     }
    //                     observer.next('Check Out Respoitory')
    //                   })
    //       // -- git checkout params.repoURL projectDir
    //       // -- git add --all
    //       // -- git commit -m 'Initial commit'
    //       // -- git push
    //     })
    //   }
    // },
  // ])
// }
exports.buildTasklist = buildTasklist
