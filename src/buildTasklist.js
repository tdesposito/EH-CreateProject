const listr = require('listr')

exports.buildTasklist = (params) => {
  return new listr([
    {
      title: 'Update local AWS CLI configuration',
      task: updateAWSConfig(params.profile, params.roleARN)
    },
    {
      title: 'Download the template',
      task: extractTemplate(params.projectDir, templateURL)
    },
    {
      title: 'Configure the tempate',
      task: updateTemplate(params.projectDir, params)
    },
    {
      title: 'Update package.json',
      task: () => { } // need to make func
    },
    {
      title: 'Create Hosting Environment(s)',
      task: () => { } // need to make func
    },
    {
      title: 'Initializing Project Directory',
      task: () => { } // need to make func
    },
    {
      title: 'Creating Code Repository',
      task: () => { } // need to make func
    },
  ])
}
