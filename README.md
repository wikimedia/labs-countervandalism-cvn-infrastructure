CVN Infrastructure
==============

See [CVN documentation on Meta-Wiki](https://meta.wikimedia.org/wiki/Countervandalism_Network/Infrastructure) for a high-level overview of the infrastructure.

## Server configuration

Our servers run at Wikimedia Cloud in a dedicated Nova project at https://wikitech.wikimedia.org/wiki/Nova_Resource:Cvn.

The [setup.yaml](./setup.yaml) file in this repository describes how all instances are configured. It is a bit like Puppet or Chef, except written for human interpretation. Though declared as brief as possible for unambiguous execution.

Legend:
* `global @once` section: Describes global dependencies that were set up once. This is mostly a description of the project's global state. These would have to be re-done in case of project re-creation.

* `node @each` section: Describes the steps that apply to all instances. These are run when creating new instances, such as web servers or application servers.

* `debian` steps: Install packages from the Ubuntu package repository (through `apt-get install`).

* `services` steps: Install these services by performing the steps under the relevant `service` section.

* `setup` steps: Perform these actions via Bash. May contain variables and interactive instructions (not a completely valid shell script). Uses `{value}` placeholders. The `edit` and `create` command refer to creation and editing of files on disk. Command `exec {key}` includes steps from the referred key within the same service or node section.

* Any steps with differt names (e.g. `prepare`) should be ignored until and unless they are referenced by an `exec` command.

## MegaTable

![](./docs/MegaTable_2014.png)

## Website

Production: https://cvn.wmcloud.org/

Local development: <http://localhost:4000/

```
php -S localhost:4000 -t cvn-docroot/
```
