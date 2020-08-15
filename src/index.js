/**
 * @file Bootstrap a new website project based on a template.
 *
 * @author Todd D. Esposito <todd@espositoholdings.com>
 * @copyright Copyright 2020 Todd D. Esposito.
 * @license Released under the MIT license.
 */

const inq = require('inquirer')
const {Command, flags} = require('@oclif/command')

const {buildTasklist} = require('./buildTasklist')

const types_usesS3 = ['static', 'react', 'eleventy'].sort()
const types_usesEB = ['flask', 'node'].sort()
const types = [...types_usesS3, ...types_usesEB, 'hybrid'].sort()

const templateURL = 'https://github.com/tdesposito/Website-Template'

class CreateEHProject extends Command {
  async run() {
    const {args, flags} = this.parse(CreateEHProject)
    var answers = await inq.prompt([
      { name: 'type', message: "Type", type: 'list', choices: types, default: flags.type, when: !(flags.type) },
      { name: 'name', message: "Name", type: 'input', default: flags.name, when: !(flags.name) },
      { name: 'description', message: "Description", type: 'input', default: flags.description, when: !(flags.description) },
      { name: 'domain', message: "Site Domain", type: 'input', default: flags.domain, when: !(flags.domain) },
      { name: 'role', message: "AWS Role ARN (empty for no external role)", type: 'input', default: flags.role, when: !(flags.role) },
    ])

    var params = {
      initRepo: ! flags.noinitrepo,
      initDev: ! flags.noinitdev,
      initHosting: ! flags.noinithosting,
      templateURL: templateURL,
      packageName: (answers.name || flags.name).split(' ').join('-').toLowerCase(),
      projectName: (answers.name || flags.name).split(' ').join(''),
      projectType: (answers.type || flags.type),
      roleARN: answers.role || flags.role,
      siteDescription: (answers.description || flags.description),
      siteDomain: (answers.domain || flags.domain),
      siteName: (answers.name || flags.name),
      alphaConfig: {},
      prodConfig: {},
    }
    params.profile = (params.roleARN ? params.projectName.toLowerCase() : "default")
    params.projectDir = args.dir || params.projectName
    params.projectHosting = (types_usesS3.includes(params.projectType) ? "s3hosted" : "elasticbeanstalk")
    params.repoURL = `codecommit::us-east-1://${params.profile}@${params.projectName}-Website`
    params.siteURL = `https://${params.siteDomain}`
    if (params.projectType === "hybrid") {
      answers = await inq.prompt([
        { name: 'frontend', message: "Front End App Type", type: 'list', choices: types_usesS3},
        { name: 'backend', message: "Back End App Type", type: 'list', choices: types_usesEB},
      ])
      params = {...params, ...answers}
      params.frontendSource = 'frontend'
      params.frontendBuildTarget = '/build/static/frontend'
    } else {
      params.frontendSource = 'site'
      params.frontendBuildTarget = '/build'
    }

    console.log('\n')
    const tasks = buildTasklist(params)
    await tasks.run().catch(err => {
      console.error(err)
    })
    console.log('\n')
  }
}

CreateEHProject.description = `Creates a new project based on an EH Template
This tool will create a new Website project based on the current template at
${templateURL}.

If you don't include options on the command line, we'll prompt you for the
required values.
`

CreateEHProject.args = [
  {name: "dir", required: false, description: "the directory in which to create the project; defaults to the site name"}
]

CreateEHProject.flags = {
  // our flags for project config
  type: flags.string({options: types, description: 'The type of site to build'}),
  name: flags.string({char: 'n', description: 'Site Name'}),
  description: flags.string({char: 'd', description: "Site Description"}),
  domain: flags.string({char: 'u', description: "Site domain"}),
  role: flags.string({char: 'r', description: "AWS Role ARN"}),
  noinitdev: flags.boolean({default: false, description: 'Skip initilization of the dev environment'}),
  noinitrepo: flags.boolean({default: false, description: 'Skip creation of the repository'}),
  noinithosting: flags.boolean({default: false, description: 'Skip creation of the hosting resources'}),
  // oclif flag (--help, --version)
  version: flags.version({char: 'v'}),
  help: flags.help({char: 'h'}),
}

module.exports = CreateEHProject
