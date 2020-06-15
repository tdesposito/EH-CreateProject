/**
 * @file Bootstrap a new website project based on a template.
 *
 * @author Todd D. Esposito <todd@espositoholdings.com>
 * @copyright Copyright 2020 Todd D. Esposito.
 * @license Released under the MIT license.
 */

const fs = require('fs')
const {Command, flags} = require('@oclif/command')
const inq = require('inquirer')
// const listr = require('listr')

const {updateAWSConfig} = require('./updateAWSConfig')
const {extractTemplate} = require('./extractTemplate')
const {updateTemplate} = require('./updateTemplate')

const t_usesS3 = ["static", "react"]
const t_usesEB = ["flask", "node"]
const types = [...t_usesS3, ...t_usesEB]

const templateURL = "https://github.com/tdesposito/Website-Template"

class CreateEHProject extends Command {
  async run() {
    const {args, flags} = this.parse(CreateEHProject)
    const answers = await inq.prompt([
      { name: 'type', message: "Type", type: 'list', choices: types, default: flags.type, when: !(flags.type) },
      { name: 'name', message: "Name", type: 'input', default: flags.name, when: !(flags.name) },
      { name: 'description', message: "Description", type: 'input', default: flags.description, when: !(flags.description) },
      { name: 'domain', message: "Site Domain", type: 'input', default: flags.domain, when: !(flags.domain) },
      { name: 'role', message: "AWS Role ARN (empty for no external role)", type: 'input', default: flags.role, when: !(flags.role) },
    ])

    var params = {
      packageName: (answers.name || flags.name).split(' ').join('-').toLowerCase(),
      projectName: (answers.name || flags.name).split(' ').join(''),
      projectType: (answers.type || flags.type),
      roleARN: answers.role || flags.role,
      siteDescription: (answers.description || flags.description),
      siteDomain: (answers.domain || flags.domain),
      siteName: (answers.name || flags.name),
    }
    params.profile = (params.roleARN ? params.projectName.toLowerCase() : "default")
    params.projectDir = args.dir || params.projectName
    params.projectHosting = (t_usesS3.includes(params.projectType) ? "s3hosted" : "elasticBeanstalk")
    params.repoURL = `codecommit::us-east-1://${params.profile}@${params.projectName}-Website`
    params.siteURL = `https://${params.siteDomain}`

    var cloudfront = {}
    if (t_usesS3.includes(params.projectType)) {
      // TODO: make a CloudFront distribution for the production bucket, rather than prompting
      let cloudfront = await inq.prompt([
        { name: 'distid', message: "Distribution ID (or leave empty)", type: 'string' },
      ])
    }

    if (params.roleARN) {
      // Update our aws cli config with the new project profile
      updateAWSConfig(params.profile, params.roleARN)
    }

    if (cloudfront.distid) {
      // TOOD: build the CodeCommit repo for the project, check it out to ${dir}
    }

    await extractTemplate(params.projectDir, templateURL)

    updateTemplate(params.projectDir, params)

    console.log("updating package.json...")
    let pkg = JSON.parse(fs.readFileSync(`${params.projectDir}/package.json`).toString('utf-8'))
    pkg.name = `${params.packageName}-website`
    pkg.description = params.siteDescription
    pkg.repository = params.repoURL
    pkg.ehTemplate.type = params.projectType
    pkg.ehTemplate.roleARN = params.roleARN
    pkg.ehTemplate.hosting = params.projectHosting

    let envs = pkg.ehTemplate.environments
    if (t_usesS3.includes(params.projectType)) {
      // if we're s3, we need alpha/production buckets
      envs.alpha.bucket = `s3://alpha.${params.siteDomain}`
      envs.production.bucket = `s3://${params.siteDomain}`
      // TODO: make these buckets, configure for web hosting
      if (cloudfront.distid) {
        envs.production.distribution = cloudfront.distid
      }
    } else {
      // TODO: get eb config we need for deploys
    }

    // Update package.json with our config
    fs.writeFileSync(`${params.projectDir}/package.json`, JSON.stringify(pkg, null, 2))
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
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
  type: flags.string({options: types, description: 'The type of site to build'}),
  name: flags.string({char: 'n', description: 'Site Name'}),
  description: flags.string({char: 'd', description: "Site Description"}),
  domain: flags.string({char: 'u', description: "Site domain"}),
  role: flags.string({char: 'r', description: "AWS Role ARN"}),
}

module.exports = CreateEHProject
