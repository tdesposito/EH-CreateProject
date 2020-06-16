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

const {updateAWSConfig} = require('tasks/updateAWSConfig')
const {extractTemplate} = require('tasks/extractTemplate')
const {updateTemplate} = require('tasks/updateTemplate')

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
      // TODO: should we consider parameterizing region?
      envs.alpha.siteurl = `http://alpha.${params.siteDomain}.s3-website-us-east-1.amazonaws.com`
      envs.production.bucket = `s3://${params.siteDomain}`
      // TODO: make these buckets, configure for web hosting
      // -- aws s3api create-bucket --bucket my-bucket --region us-east-1
      // -- aws s3 website s3://my-bucket/ --index-document index.html --error-document error.html

      // TODO: create the distribution for the production domain
      // -- aws cloudfront create-distribution --distribution-config file://distconfig.json
      // -- see: https://stackoverflow.com/questions/26094615/aws-cli-create-cloudfront-distribution-distribution-config
      }
      if (cloudfront.distid) {
        envs.production.distribution = cloudfront.distid
      }
    } else {
      // TODO: get eb config we need for deploys
    }

    // Update package.json with our config
    fs.writeFileSync(`${params.projectDir}/package.json`, JSON.stringify(pkg, null, 2))

    // TOOD: build the CodeCommit repo for the project
    // -- aws codecommit create-repository --repository-name ${params.projectName}-Website --repository-description "Your source code for your website resides here."
    // -- git checkout params.repoURL projectDir
    // -- git add --all
    // -- git commit -m 'Initial commit'
    // -- git push

    // TODO: init the project
    // -- npm install
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
  version: flags.version({char: 'v'}),
  help: flags.help({char: 'h'}),
  type: flags.string({options: types, description: 'The type of site to build'}),
  name: flags.string({char: 'n', description: 'Site Name'}),
  description: flags.string({char: 'd', description: "Site Description"}),
  domain: flags.string({char: 'u', description: "Site domain"}),
  role: flags.string({char: 'r', description: "AWS Role ARN"}),
}

module.exports = CreateEHProject
