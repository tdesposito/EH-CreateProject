/**
 * @file Creates either an S3- or ElasticBeanstalk-based hosting environment
 *
 * Part of the create-ehproject tool.
 *
 * @author Todd D. Esposito <todd@espositoholdings.com>
 * @copyright Copyright 2020 Todd D. Esposito.
 * @license Released under the MIT license.
 */

const execa = require('execa')
const listr = require('listr')

/**
 * @function createS3Bucket Creates a single S3 bucket
 *
 * @param {str} name - bucket name.
 * @param {str} profile - AWS profile name.
 */
async function createS3Bucket(name, profile) {
  var {stdout} = await execa('aws', `s3api create-bucket --bucket ${name} --region us-east-1 --profile ${profile}`.split(' '))
  // TODO: verify stdout
  var {stdout} = await execa('aws', `s3 website s3://${name}/ --index-document index.html --error-document error.html --profile ${profile}`.split(' '))
  // TODO: verify stdout
}

/**
 * @function initHostingEnv Creates the tasks needed to build the hosting environment
 *
 * @param {Object} params - Project parameters.
 * @returns {Object} - a Listr object with the appropriate sub-tasks.
 */
function initHostingEnv(params) {
  switch (params.projectHosting) {
    case 's3hosted':
      params.alphaConfig.bucket = `alpha.${params.siteDomain}`
      params.alphaConfig.url = `http://alpha.${params.siteDomain}.s3-website-us-east-1.amazonaws.com`
      params.prodConfig.bucket = params.siteDomain
      return new listr([
        {
          title: 'Create bucket for alpha',
          task: () => createS3Bucket(params.alphaConfig.bucket, params.profile)
        },
        {
          title: 'Create bucket for production',
          task: () => createS3Bucket(params.prodConfig.bucket, params.profile)
        },
        // TODO: create a CloudFront distribution for production.
        // -- aws cloudfront create-distribution --distribution-config file://distconfig.json
        // -- see: https://stackoverflow.com/questions/26094615/aws-cli-create-cloudfront-distribution-distribution-config
      ])
    default:
      return () => { throw new Error('Undefined hosting type') }
  }
}

exports.initHostingEnv = initHostingEnv
