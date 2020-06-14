const fs = require('fs')
const {Command, flags} = require('@oclif/command')
const inq = require('inquirer')
const AWS = require('aws-sdk')
const S3 = require('aws-sdk/clients/s3')
const CodeCommit = require('aws-sdk/clients/codecommit')

const {updateAWSConfig} = require('./updateAWSConfig')

const t_usesS3 = ["static", "react"]
const t_usesEB = ["flask", "node"]
const types = [...t_usesS3, ...t_usesEB]

const templateURL = "https://github.com/tdesposito/Website-Template"

class CreateEhprojectCommand extends Command {
  async run() {
    const {args, flags} = this.parse(CreateEhprojectCommand)
    const answers = await inq.prompt([
      { name: 'type', message: "Type", type: 'list', choices: types, default: flags.type, when: !(flags.type) },
      { name: 'name', message: "Name", type: 'input', default: flags.name, when: !(flags.name) },
      { name: 'description', message: "Description", type: 'input', default: flags.description, when: !(flags.description) },
      { name: 'url', message: "Site URL", type: 'input', default: flags.url, when: !(flags.url) },
      { name: 'role', message: "AWS Role ARN (empty for no external role)", type: 'input', default: flags.role, when: !(flags.role) },
    ])

    const prjname = (answers.name || flags.name).split(' ').join('')
    const dir = args.dir || prjname
    const pkgname = (answers.name || flags.name).split(' ').join('-').toLowerCase()
    const profile = prjname.toLowerCase()
    const repoURL = `codecommit::us-east-1://${profile}@${prjname}-Website`

    const roleARN = answers.role || flags.role
    if (roleARN) {
      // Update our aws cli config with the new project profile
      updateAWSConfig(profile, roleARN)
      // Update our credentials based on the new profile
      var credentials = new AWS.SharedIniFileCredentials({profile: profile})
      AWS.config.credentials = credentials
    }

    // TOOD: build the CodeCommit repo for the project, check it out to ${dir}

    // TODO: download and expand the template into ${dir}
    // await fetch(`${templateURL}/archive/master.zip`)

    // TODO: Update the ./README.md with the project name


    var pkg = require(`${dir}/package.json`)

    pkg.name = `${pkgname}-website`
    pkg.description = answers.description || flags.description
    pkg.repository = repoURL
    pkg.ehTemplate.type = answers.type || flags.type
    pkg.ehTemplate.roleARN = roleARN
    if (t_usesS3.includes(pkg.ehTemplate.type)) {
      pkg.ehTemplate.hosting = "s3hosted"
    } else {
      pkg.ehTemplate.hosting = "elasticBeanstalk"
    }

    let envs = pkg.ehTemplate.environments
    if (t_usesS3.includes(answers.type || flags.type)) {
      // if we're s3, we need alpha/production buckets
      envs.alpha.bucket = `s3://alpha.${answers.url || flags.url}`
      envs.production.bucket = `s3://${answers.url || flags.url}`
      // TODO: make these buckets, configure for web hosting

      const s3ans = await inq.prompt([
        { name: 'distid', message: "Distribution ID (or leave empty)", type: 'string' },
      ])
      // TODO: make a CloudFront distribution for the production bucket
      if (s3ans.distid) {
        envs.production.distribution = s3ans.distid
      }
    } else {
      // TODO: get eb config we need for deploys
    }

    // Update package.json with our config
    fs.writeFileSync(`${dir}/package.json`, JSON.stringify(pkg, null, 2))
  }
}

CreateEhprojectCommand.description = `Creates a new project based on an EH Template
This tool will create a new Website project based on the current template at
${templateURL}.

If you don't include options on the command line, we'll prompt you for the
required values.
`

CreateEhprojectCommand.args = [
  {name: "dir", required: false, description: "the directory in which to create the project; defaults to the site name"}
]

CreateEhprojectCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
  type: flags.string({options: types, description: 'The type of site to build'}),
  name: flags.string({char: 'n', description: 'Site Name'}),
  description: flags.string({char: 'd', description: "Site Description (for SEO)"}),
  url: flags.string({char: 'u', description: "Site URL"}),
  role: flags.string({char: 'r', description: "AWS Role ARN"}),
}

module.exports = CreateEhprojectCommand
