# EH-CreateProject

A tool to create a new project from a [template](https://github.com/tdesposito/Website-Template).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/tdesposito/EH-CreateProject/master?label=Version)
<!-- [![Downloads/week](https://img.shields.io/npm/dw/create-ehproject.svg)](https://npmjs.org/package/create-ehproject) -->
<!-- [![License](https://img.shields.io/npm/l/create-ehproject.svg)](https://github.com/tdesposito/EH-CreateProject/blob/master/package.json) -->

<!-- toc -->
* [Usage](#usage)
* [Options](#options)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g create-ehproject
$ create-ehproject [DIR] [OPTIONS]
...
$ create-ehproject --help
Creates a new project based on an EH Template

USAGE
  $ create-ehproject [DIR]

ARGUMENTS
  DIR  the directory in which to create the project; defaults to the site name

OPTIONS
  -d, --description=description   Site Description
  -h, --help                      show CLI help
  -n, --name=name                 Site Name
  -r, --role=role                 AWS Role ARN
  -u, --domain=domain             Site domain
  -v, --version                   show CLI version
  --type=static|react|flask|node  The type of site to build

DESCRIPTION
  This tool will create a new Website project based on the current template at
  https://github.com/tdesposito/Website-Template.

  If you don't include options on the command line, we'll prompt you for the
  required values.
```
<!-- usagestop -->

# Options
<!-- options -->
We collect via command line switches or interactively these details:

-d, --description=description
> Site Description. We include this description in meta tags

-n, --name=name
> Site Name

-r, --role=role
> AWS Role ARN

-u, --domain=domain
> Site domain. We automatically make URLS for alpha and production sites.

--type=type
> The type of site to build:
> * static - a simple, hand-built site hosted with s3/CloudFront, maybe Lambda
> * react - **planned but not yet implemented**
> * flask - **planned but not yet implemented**
> * node - **planned but not yet implemented**

<!-- optionsstop -->

# To Do Items
<!-- todo -->
Please see the [Roadmap](ROADMAP.md)
<!-- todostop -->
