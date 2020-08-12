# EH-CreateProject Roadmap

The intent is to add functionality as my project list demands it. So this is
*highly* subject to change.

## Milestones/To Dos

1. Add more AWS automation
    * ~~Create the CodeCommit repository.~~
    * ~~Create S3 buckets for s3-hosted sites.~~
    * Create a CloudFront distribution.
    * Link a Route53 zone record to the CloudFront distribution.
      * Since distributions take some time to be visible, this may not be viable.
1. Add ElasticBeanstalk support
    * We need to install/update /site/.elasticbeanstalk/config.yml (at least)
    * This requires a change to the template to include a hosting-specific subdir
    * And a change to `extractTemplate()` to handle hosting-specific (and maybe type-specific) content.
