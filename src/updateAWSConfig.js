const fs = require('fs')
const ini = require('ini')
const homedir = require('os').homedir()

exports.updateAWSConfig = (name, arn) => {
  var awscfg = ini.parse(fs.readFileSync(`${homedir}/.aws/config`, {encoding: 'utf8', flag:'r'}))
  awscfg[`profile ${name}`] = {
    source_profile: 'default',
    role_session_name: 'CodeCommitAccess',
    role_arn: arn,
    region: 'us-east-1'
  }
  fs.writeFileSync(`${homedir}/.aws/config`, ini.stringify(awscfg))
}
