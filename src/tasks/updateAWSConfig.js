/**
 * @file Update the local AWS CLI configuration file.
 *
 * Part of the create-ehproject tool.
 *
 * @author Todd D. Esposito <todd@espositoholdings.com>
 * @copyright Copyright 2020 Todd D. Esposito.
 * @license Released under the MIT license.
 */

const fs = require('fs')
const ini = require('ini')
const homedir = require('os').homedir()

/**
 * @function updateAWSConfig Add or update a [profile ...] section to the AWC CLI configuration
 *
 * @param {string} name - profile name to add/update
 * @param {string} arn - AWS Role ARN for the profile
 */
function updateAWSConfig(name, arn) {
  var awscfg = ini.parse(fs.readFileSync(`${homedir}/.aws/config`, {encoding: 'utf8', flag:'r'}))
  awscfg[`profile ${name}`] = {
    source_profile: 'default',
    role_session_name: 'CodeCommitAccess',
    role_arn: arn,
    region: 'us-east-1'
  }
  fs.writeFileSync(`${homedir}/.aws/config`, ini.stringify(awscfg))
  return ('AWS Updated.')
}

exports.updateAWSConfig = updateAWSConfig
