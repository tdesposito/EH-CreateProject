/* create-ehproject bootstraps a new website project based on a template.
 *
 */

const fs = require('fs')
const {Command, flags} = require('@oclif/command')
const inq = require('inquirer')

const {updateAWSConfig} = require('./updateAWSConfig')
const {extractTemplate} = require('./extractTemplate')

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

    const prjname = (answers.name || flags.name).split(' ').join('')
    const dir = args.dir || prjname
    const pkgname = (answers.name || flags.name).split(' ').join('-').toLowerCase()

    const roleARN = answers.role || flags.role
    var profile = prjname.toLowerCase()
    if (roleARN) {
      // Update our aws cli config with the new project profile
      updateAWSConfig(profile, roleARN)
    } else {
      profile = 'default'
    }
    const repoURL = `codecommit::us-east-1://${profile}@${prjname}-Website`

    // TOOD: build the CodeCommit repo for the project, check it out to ${dir}

    await extractTemplate(dir, templateURL)

    console.log('updating README.md...')
    let readme = fs.readFileSync(`${dir}/README.md`).toString('utf-8')
    readme = readme.replace("${ProjectName}", prjname)
    fs.writeFileSync(`${dir}/README.md`, readme)

    console.log('updating site/sitemap.xml...')
    let sitemap = fs.readFileSync(`${dir}/site/sitemap.xml`).toString('utf-8')
    sitemap = sitemap.replace("${SiteURL}", `https://${answers.domain || flags.domain}`)
    fs.writeFileSync(`${dir}/site/sitemap.xml`, sitemap)


    console.log("updating package.json...")
    let pkg = JSON.parse(fs.readFileSync(`${dir}/package.json`).toString('utf-8'))
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
      envs.alpha.bucket = `s3://alpha.${answers.domain || flags.domain}`
      envs.production.bucket = `s3://${answers.domain || flags.domain}`
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
