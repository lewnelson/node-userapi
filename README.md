[![Build Status](https://img.shields.io/travis/lewnelson/node-userapi.svg)](https://travis-ci.org/lewnelson/node-userapi)
[![Test Coverage](https://img.shields.io/coveralls/lewnelson/node-userapi.svg)](https://coveralls.io/github/lewnelson/node-userapi)
[![Dependencies](https://img.shields.io/david/lewnelson/node-userapi.svg)](https://david-dm.org/lewnelson/node-userapi)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/lewnelson/node-userapi/blob/master/LICENSE.md)

# USER API DOCUMENTATION
---
## Contents
* [Demo](#demo)
* [Quick Start](#getting-started)
  * [Using Docker](#using-docker)
  * [Using node](#using-node)
  * [Seeding Database](#seeding-database)
* [Dependencies](#dependencies)
* [API Usage](#api-usage)
  * [Overview](#overview)
  * [Errors](#errors)
    * [Error Codes](#error-codes)
  * [Resource Collections](#resource-collections)
  * [Resources](#resources)
    * [Users](#users)
* [Configuration](#configuration)
* [Testing](#testing)

## Demo
---
Demo available at [http://userapi.lewnelson.com/](http://userapi.lewnelson.com/) and can be accessed using your interface of choice, I recommend [Postman](https://www.getpostman.com/).


## Getting Started
---
#### Using Docker
The quickest way to host your own instance is to use the publicly available docker image available [here](https://cloud.docker.com/swarm/lewnelson/repository/registry-1.docker.io/lewnelson/node-userapi/general). If you want to use custom configuration (see [configuration](#configuration) for more details) then you can map your config file using this command when starting the docker container.
```
docker run -d -p 8080:8080 -v /path/to/host/app_config/directory:/mnt/data lewnelson/user-api
```
The `/path/to/host/app_config/directory` path should be a path to a directory on your system which should contain an `app_config.yaml` file compatible with the [configuration](#configuration) section. This command will also run the docker container as a daemon process and bind the host port `8080` to the container port `8080`. If you are using `app_config.yaml` then you do not need to set the port.

#### Using Node
If you don't want to use docker then you can use node provided you have all the [dependencies](#dependencies) installed. An `app_config.yaml` file is optional as it is using docker, it should be placed in the application root directory, i.e. alongside `sample_app_config.yaml`. To start the server run:
```
npm start
```
This will setup the database based on your configuration, it defaults to an sqlite database using the filesystem and will create a file called `database.sqlite` in the application root. It will also start the server as well. If you want to stop the process simply run:
```
npm stop
```
The process is managed via the [forever](https://www.npmjs.com/package/forever) npm package.

#### Seeding Database
To seed the database with random data you can run:
```
node seed.js {amount}
```
Where amount is an unsigned integer for the amount of records to randomly generate for the database users table. Amount defaults to 500. This will use the database connection from `app_config.yaml` or the default sqlite connection and will clear all tables before seeding with new data.

## Dependencies
---
* node >= 6.10
* npm >= 3.10
* sqlite >= 3.11 (only if no database configuration has been defined)

## API Usage
---

#### Overview
The API follows REST design patterns and is versioned on the URI path. Errors and resources share common layouts and responses make use of HTTP status codes. Below are a list of available versions:
* `/v1/` - example URI path, `/v1/users/`

#### Errors
Errors are defined by responses with status codes in the `4XX` or `5XX` range where `4XX` are user errors and `5XX` server errors. All errors follow the same format as shown below:
```json
{
  "error": {
    "code": "integer, usually matches HTTP status",
    "message": "string, short description of the error",
    "context": "object, further context on the error"
  }
}
```
In debug mode server errors are more verbose and contain a full stack trace of the error.

##### Error Codes
* `400` - bad request body
* `404` - resource not found
* `405` - method not allowed, see `Allow` response header for allowed methods
* `409` - resource conflict, occurs on create or update resource, see error context for further detail
* `500` - generic server error, see logs or debug output for more details

#### Resource Collections
Resource collections are all formatted in a paginated format and can be navigated using the URL query parameters. The results can also be sorted on multiple fields where the field has the `sortable` attribute. Any attempts to sort on an unsortable field is ignored and multiple sorts on a field result in the first sort value being used. Below is an example of what a resource collection response body looks like:
```json
{
    "count": "integer, total amount of resources",
    "href": "string, URI path to the current request",
    "currentPage": "integer, the current page being served",
    "nextPage": "string|null, the URI path to the next page, null if no next page available",
    "previousPage": "string|null, the URI path to the previous page, null if not previous page available",
    "results": "array, array of resources"
}
```
By default all resources are limited to `100` per page on collections. Some collections may allow more or less than this and are defined per resource. Collections generally allow `GET` and `POST` requests to retrieve and create data respectively. `POST` requests require that all resource fields with the `required` attribute are provided, `readonly` fields are ignored.

To request a specific page for a resource the following query parameter can be used:
```
?page=page_number
```
Where `page_number` is an integer page number value.

To sort results the following query parameter can be used:
```
?sort=ASC_field_1,DESC_field_2
```
This will primarily sort in `ascending` order on a field called `field_1` and secondary sort in `descending` order on `field_2`.

#### Resources

Individual resources should all have the following properties:
* `href` - string, URI path to the resource
* `createdAt` - string, ISO 8601 formatted date time string when the resource was created
* `updatedAt` - string, ISO 8601 formatted date time string when the resource was last updated

All resources generally have the following request methods available, `GET`, `PUT`, `PATCH`, `DELETE` to read, overwrite, update and delete a resource respectively. `GET` requests return the resource object. `PUT` requests require that all `required` fields are provided and any non-required and non-readonly fields are assigned their default value. `PATCH` requests allow updating only selected fields of data where other fields remain as they were. `DELETE` requests return an empty response with a status of `200`.

Any reference to `:parameter` in the resource schemas reference a variable from the resource i.e. `:id` references a resources `id` parameter.

The following attributes may appear on resource fields:
* `primary` - the primary key of the resource
* `readonly` - a read only field
* `sortable` - collections can be sorted on this field
* `required` - this field is required for `PUT` and `POST` requests
* `unique` - this field has a unique constraint and will result in resource conflicts when it clashes with anothe resource on the same namespace.
* 
##### Users

Available endpoints:
```
GET, POST /v1/users/
GET, PUT, PATCH, DELETE /v1/users/:id
```
Resource schema:

| parameter | attributes | description |
| --------- | ---------- | ----------- |
| `id` | `[primary, readonly, sortable]` | User primary key |
| `email` | `[required, sortable, unique]` | Must be a valid and unique email address, limited to 255 characters. |
| `forename` | `[required, sortable]` | Cannot contain numeric characters, limited to 255 characters |
| `surname` | `[required, sortable]` | Cannot contain numeric characters, limited to 255 characters |

Example user:
```json
{
  "id": 1,
  "email": "user.name@example.org",
  "forename": "User",
  "surname": "Name",
  "createdAt": "2017-06-03T11:52:07.348Z",
  "updatedAt": "2017-06-03T14:00:05.823Z",
  "href": "/v1/users/1"
}
```

## Configuration
---

There are various configuration value available and can be set in a file called `app_config.yaml` which should be located in the application root directory alongside the `sample_app_config.yaml`. The `sample_app_config.yaml` file contains more information on the config values available and how the config file is compiled when the server is started.

## Testing
---

All tests are located in the subdirectory called `/tests/`, the tests are run via [Mocha](https://www.npmjs.com/package/mocha) and coverage is generated using [Istanbul](https://www.npmjs.com/package/istanbul). Tests are mapped file to file inside the `/app/` subdirectory and each test file is suffixed with `Test`. To run the tests run:
```
npm test
```
To see the coverage report as HTML the report can be hosted using:
```
node coverage.js
```
This will bind to a free port and console log the port it is bound to as well as the URI path to reach the coverage report.