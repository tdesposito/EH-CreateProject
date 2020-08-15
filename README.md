# create-ehproject
A tool to create a new project from a [template](https://github.com/tdesposito/Website-Template).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/tdesposito/EH-CreateProject/master?label=Version)
[![Downloads/week](https://img.shields.io/npm/dw/create-ehproject.svg)](https://npmjs.org/package/create-ehproject)
[![License](https://img.shields.io/npm/l/create-ehproject.svg)](https://github.com/tdesposito/EH-CreateProject/blob/master/package.json)

# Usage
```sh-session
$ npm install -g create-ehproject
$ create-ehproject COMMAND
running command...
$ create-ehproject (-v|--version|version)
create-ehproject/1.0.1 win32-x64 node-v12.13.1
$ create-ehproject --help [COMMAND]
USAGE
  $ create-ehproject COMMAND
...
```

# Options
We collect via command line switches or interactively these details:

-d, --description=description
> Site Description. We include this description in meta tags

-n, --name=name
> Site Name

-r, --role=role
> AWS Role ARN

-u, --domain=domain
> Site domain name.

--type=type
> The type of site to build:
> * static - a simple, hand-built site. Hosting is S3.
> * eleventy - a static site generated by eleventy. Hosting is S3
> * flask - a Flask (Python) application. Hosting is ElasticBeanstalk.
> * react - a React site. There are a few differences in project layout from CRA. Hosting is S3.
> * node - **planned but not yet implemented**
> * hybrid - a hybrid app with separate frontend and backend apps (from the types above). Hosting is ElasticBeanstalk.

In addition, you can turn off some aspects of the process:

--noinitdev
> Don't initialize the development environment. This is not recommended, but if you wanna...

--noinithosting
> If your hosting is already set up, use this. You'll have to edit the `ehTemplate` settings in your `package.json` yourself to use the deploy/publish features.

--noinitrepo
> Don't create and connect to the CodeCommit repo.

# To Do Items
<!-- todo -->
Please see the [Roadmap](ROADMAP.md)
<!-- todostop -->
