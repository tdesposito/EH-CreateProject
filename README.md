# EH-CreateProject

A tool to create a new project from a [template](https://github.com/tdesposito/Website-Template).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/tdesposito/EH-CreateProject/master?label=Version)
<!-- [![Downloads/week](https://img.shields.io/npm/dw/create-ehproject.svg)](https://npmjs.org/package/create-ehproject) -->
<!-- [![License](https://img.shields.io/npm/l/create-ehproject.svg)](https://github.com/tdesposito/EH-CreateProject/blob/master/package.json) -->

<!-- toc -->
* [EH-CreateProject](#eh-createproject)
* [Usage](#usage)
* [Options](#options)
* [To Do Items](#to-do-items)
<!-- tocstop -->
# Usage
<!-- usage -->
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
> * eleventy - a static site generated by eleventy.
> * react - **planned but not yet implemented**
> * flask - **planned but not yet implemented**
> * node - **planned but not yet implemented**

<!-- optionsstop -->

# To Do Items
<!-- todo -->
Please see the [Roadmap](ROADMAP.md)
<!-- todostop -->
