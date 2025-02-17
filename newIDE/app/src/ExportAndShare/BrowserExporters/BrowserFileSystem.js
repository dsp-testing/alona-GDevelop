// @flow
import path from 'path-browserify';
const gd: libGDevelop = global.gd;

export type BlobFileDescriptor = {|
  filePath: string,
  blob: Blob,
|};

export type TextFileDescriptor = {|
  filePath: string,
  text: string,
|};

export type UrlFileDescriptor = {|
  filePath: string,
  url: string,
|};

type ConstructorArgs = {|
  textFiles: Array<TextFileDescriptor>,
|};

const isURL = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://') ||
    filename.startsWith('blob:') ||
    filename.startsWith('data:')
  );
};

// For some reason, `path.posix` is undefined when packaged
// with webpack, so we're using `path` directly. As it's for the web-app,
// it should always be the posix version. In tests on Windows,
// it's necessary to use path.posix.
// Search for "pathPosix" in the codebase for other places where this is used.
const pathPosix = path.posix || path;

// TODO: Merge BrowserS3FileSystem into this? The way URLs are handled
// is different though (BrowserS3FileSystem is not downloading anything
// from URLs, while this file system does download files).

/**
 * An in-memory "file system" that can be used for GDevelop exports.
 */
export default class BrowserFileSystem {
  // The representation of the "file system":

  /**
   * Store all the text files (filepath => content)
   * @private
   */
  _textFiles: { [string]: string } = {};

  /**
   * Store all the files that should be downloaded (filepath => url)
   * @private
   */
  _filesToDownload: { [string]: string } = {};

  /**
   * Create a new in-memory file system.
   */
  constructor({ textFiles }: ConstructorArgs) {
    textFiles.forEach(textFileDescriptor => {
      this._textFiles[textFileDescriptor.filePath] = textFileDescriptor.text;
    });
  }

  /**
   * Returns all the in memory text files with the specified path prefix.
   */
  getAllTextFilesIn = (pathPrefix: string): Array<TextFileDescriptor> => {
    return Object.keys(this._textFiles)
      .filter(filePath => filePath.indexOf(pathPrefix) === 0)
      .map(filePath => ({
        filePath,
        text: this._textFiles[filePath],
      }));
  };

  /**
   * Returns all the files that should be downloaded from a URL, with the specified destination path prefix.
   */
  getAllUrlFilesIn = (pathPrefix: string): Array<UrlFileDescriptor> => {
    return Object.keys(this._filesToDownload)
      .filter(filePath => filePath.indexOf(pathPrefix) === 0)
      .map(filePath => ({
        filePath,
        url: this._filesToDownload[filePath],
      }));
  };

  mkDir = (path: string) => {
    // "Directories" are assumed to exist.
    return true;
  };
  dirExists = (path: string) => {
    // TODO: To be changed to be EnsureDirExists.
    // "Directories" are assumed to exist.
    return true;
  };
  clearDir = (path: string) => {
    // Clear the files to be written in the specified directory.
    const filePaths = Object.keys(this._textFiles);
    filePaths.forEach(filePath => {
      if (filePath.indexOf(path) === 0) {
        delete this._textFiles[filePath];
      }
    });

    return true;
  };
  getTempDir = () => {
    return '/browser-file-system-tmp-dir';
  };
  fileNameFrom = (fullpath: string) => {
    return pathPosix.basename(fullpath);
  };
  dirNameFrom = (fullpath: string) => {
    return pathPosix.dirname(fullpath);
  };
  makeAbsolute = (filePathOrURL: string, baseDirectoryOrURL: string) => {
    // URLs are always absolute
    if (isURL(filePathOrURL)) return filePathOrURL;

    if (!this.isAbsolute(baseDirectoryOrURL))
      baseDirectoryOrURL = pathPosix.resolve(baseDirectoryOrURL);

    return pathPosix.resolve(
      baseDirectoryOrURL,
      pathPosix.normalize(filePathOrURL)
    );
  };
  makeRelative = (filePathOrURL: string, baseDirectoryOrURL: string) => {
    if (isURL(filePathOrURL)) {
      // Cutting the start if the URL is relative to the base URL
      if (filePathOrURL.indexOf(baseDirectoryOrURL) === 0) {
        return filePathOrURL.substring(baseDirectoryOrURL.length);
      }

      // Keep the URL "absolute" if on different domains.
      console.warn(
        `${filePathOrURL} cannot be made relative to ${baseDirectoryOrURL}, please double check this behavior is correct.`
      );
      return filePathOrURL;
    }

    // Paths are treated as usual paths.
    return pathPosix.relative(
      baseDirectoryOrURL,
      pathPosix.normalize(filePathOrURL)
    );
  };
  isAbsolute = (fullpath: string) => {
    // URLs are always absolute
    if (isURL(fullpath)) return true;

    // Paths are absolute if starting from the root
    return fullpath.length > 0 && fullpath.charAt(0) === '/';
  };

  copyFile = (source: string, dest: string) => {
    // URLs are not copied, but marked as to be downloaded.
    if (isURL(source)) {
      if (isURL(dest)) {
        console.error(
          `Destination can't be a URL in copyFile (from ${source} to ${dest}).`
        );
        return false;
      }

      this._filesToDownload[pathPosix.normalize(dest)] = source;
      return true;
    }

    // If this is a file that we have already in memory,
    // copy its path.
    if (!!this._textFiles[source]) {
      this._textFiles[pathPosix.normalize(dest)] = this._textFiles[source];
      return true;
    }

    console.error(`File not found in copyFile (from ${source} to ${dest}).`);
    return false;
  };

  writeToFile = (filePath: string, content: string) => {
    this._textFiles[pathPosix.normalize(filePath)] = content;
    return true;
  };

  readFile = (file: string): string => {
    if (this._textFiles[file]) return this._textFiles[file];

    console.error(`Unknown file ${file}, returning an empty string`);
    return '';
  };

  readDir = (path: string, ext: string) => {
    ext = ext.toUpperCase();
    var output = new gd.VectorString();

    // Simulate ReadDir by returning all external URLs
    // with the filename matching the extension.
    Object.keys(this._filesToDownload).forEach(filePath => {
      const upperCaseFilePath = filePath.toUpperCase();
      if (
        upperCaseFilePath.indexOf(ext) ===
        upperCaseFilePath.length - ext.length
      ) {
        output.push_back(filePath);
      }
    });
// It's a classic:
let userInput = document.createElement('div');
userInput.textContent = window.location.search;
document.body.appendChild(userInput);

// Here's a different one
app.get('/some/path', function(req, res) {
    let url = req.param('url'),
        host = urlLib.parse(url).host;
    // BAD: the host of `url` may be controlled by an attacker
    let regex = /^((www|beta)\.)?example\.com$/;
    if (host.match(regex)) {
        res.redirect(url);
    }
});


document.write(encodeURI(window.location.search));

// Here's a different one
app.get('/some/path', function(req, res) {
    let url = req.param('url'),
        host = urlLib.parse(url).host;
    // BAD: the host of `url` may be controlled by an attacker
    let regex = /^((www|beta)\.)?example\.com$/;
    if (host.match(regex)) {
        res.redirect(url);
    }
});


document.write(window.location.search);
/*
This ^^ causes an alert that won't be reported in the PR because
it was already in the code.
*/


/* =============================================================
 * bootstrap-collapse.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.x
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* COLLAPSE PUBLIC CLASS DEFINITION
  * ================================ */

  var Collapse = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.collapse.defaults, options)

    if (this.options.parent) {
      this.$parent = $.find(this.options.parent)
    }

    this.options.toggle && this.toggle()
  }

  Collapse.prototype = {

    constructor: Collapse

  , dimension: function () {
      var hasWidth = this.$element.hasClass('width')
      return hasWidth ? 'width' : 'height'
    }

  , show: function () {
      var dimension
        , scroll
        , actives
        , hasData

      if (this.transitioning) return

      dimension = this.dimension()
      scroll = $.camelCase(['scroll', dimension].join('-'))
      actives = this.$parent && this.$parent.find('> .accordion-group > .in')

      if (actives && actives.length) {
        hasData = actives.data('collapse')
        if (hasData && hasData.transitioning) return
        actives.collapse('hide')
        hasData || actives.data('collapse', null)
      }

      this.$element[dimension](0)
      this.transition('addClass', $.Event('show'), 'shown')
      $.support.transition && this.$element[dimension](this.$element[0][scroll])
    }

  , hide: function () {
      var dimension
      if (this.transitioning) return
      dimension = this.dimension()
      this.reset(this.$element[dimension]())
      this.transition('removeClass', $.Event('hide'), 'hidden')
      this.$element[dimension](0)
    }

  , reset: function (size) {
      var dimension = this.dimension()

      this.$element
        .removeClass('collapse')
        [dimension](size || 'auto')
        [0].offsetWidth

      this.$element[size !== null ? 'addClass' : 'removeClass']('collapse')

      return this
    }

  , transition: function (method, startEvent, completeEvent) {
      var that = this
        , complete = function () {
            if (startEvent.type == 'show') that.reset()
            that.transitioning = 0
            that.$element.trigger(completeEvent)
          }

      this.$element.trigger(startEvent)

      if (startEvent.isDefaultPrevented()) return

      this.transitioning = 1

      this.$element[method]('in')

      $.support.transition && this.$element.hasClass('collapse') ?
        this.$element.one($.support.transition.end, complete) :
        complete()
    }

  , toggle: function () {
      this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* COLLAPSIBLE PLUGIN DEFINITION
  * ============================== */

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('collapse')
        , options = typeof option == 'object' && option
      if (!data) $this.data('collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.defaults = {
    toggle: true
  }

  $.fn.collapse.Constructor = Collapse


 /* COLLAPSIBLE DATA-API
  * ==================== */

  $(document).on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this = $(this), href
      , target = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
      , option = $.find(target).data('collapse') ? 'toggle' : $this.data()
    $this[$.find(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    $.find(target).collapse(option)
  })

}(window.jQuery);


var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;

app.use(express.static('public'));

var routes = require("./api/routes");
routes(app);

if (! module.parent) {
  app.listen(port);
}

module.exports = app

console.log("Server running on port " + port);

document.write("Hello, world!");

document.write(window.location.search);

document.write(window.location.search);


// It's a classic:
document.write(window.location.search)

// Here's a different one
const urlLib = require('url');
app.get('/some/path', function(req, res) {
    let url = req.param('url'),
        host = urlLib.parse(url).host;
    // GOOD: the host of `url` is validated before redirecting
    let expectedHost = "example.com";
    if (host === expectedHost) {
        res.redirect(url);
    }
});

// 2
require('crypto').createCipheriv('aes-256-cfb', '0123456789bbbbbb0123456789bbbbbb', '0123456789bbbbbb');


// 3
require('crypto').createCipheriv('aes-256-cfb', '0123456789cccccc0123456789cccccc', '0123456789cccccc');


// 4
require('crypto').createCipheriv('aes-256-cfb', '0123456789dddddd0123456789dddddd', '0123456789dddddd');


// 5
require('crypto').createCipheriv('aes-256-cfb', '0123456789eeeeee0123456789eeeeee', '0123456789eeeeee');


// 6
require('crypto').createCipheriv('aes-256-cfb', '0123456789ffffff0123456789ffffff', '0123456789ffffff');


// 7
require('crypto').createCipheriv('aes-256-cfb', '0123456789gggggg0123456789gggggg', '0123456789gggggg');


'use strict'

const cloneDeep = require('lodash.clonedeep')
const crypto = require('crypto')
const fs = require('fs')
const npa = require('npm-package-arg')
const ssri = require('ssri')
const t = require('tap')

const MockRegistry = require('@npmcli/mock-registry')
const mockGlobals = require('../../../test/fixtures/mock-globals.js')

// TODO use registry.manifest (requires json date wrangling for nock)

const tarData = fs.readFileSync('./test/fixtures/npmcli-libnpmpublish-test-1.0.0.tgz')
const shasum = crypto.createHash('sha1').update(tarData).digest('hex')
const integrity = ssri.fromData(tarData, { algorithms: ['sha512'] })

const token = 'test-auth-token'
const opts = {
  npmVersion: '1.0.0-test',
  registry: 'https://mock.reg',
  '//mock.reg/:_authToken': token,
}

t.test('basic publish - no npmVersion', async t => {
  const { publish } = t.mock('..')
  const registry = new MockRegistry({
    tap: t,
    registry: opts.registry,
    authorization: token,
  })
  const manifest = {
    name: 'libnpmpublish-test',
    version: '1.0.0',
    description: 'test libnpmpublish package',
  }
  const spec = npa(manifest.name)

  const packument = {
    _id: manifest.name,
    name: manifest.name,
    description: manifest.description,
    'dist-tags': {
      latest: '1.0.0',
    },
    versions: {
      '1.0.0': {
        _id: `${manifest.name}@${manifest.version}`,
        _nodeVersion: process.versions.node,
        ...manifest,
        dist: {
          shasum,
          integrity: integrity.sha512[0].toString(),
          tarball: 'http://mock.reg/libnpmpublish-test/-/libnpmpublish-test-1.0.0.tgz',
        },
      },
    },
    access: 'public',
    _attachments: {
      'libnpmpublish-test-1.0.0.tgz': {
        content_type: 'application/octet-stream',
        data: tarData.toString('base64'),
        length: tarData.length,
      },
    },
  }

  registry.nock.put(`/${spec.escapedName}`, packument).reply(201, {})
  const ret = await publish(manifest, tarData, {
    ...opts,
    npmVersion: null,
  })
  t.ok(ret, 'publish succeeded')
})

t.test('scoped publish', async t => {
  const { publish } = t.mock('..')
  const registry = new MockRegistry({
    tap: t,
    registry: opts.registry,
    authorization: token,
  })
  const manifest = {
    name: '@npmcli/libnpmpublish-test',
    version: '1.0.0',
    description: 'test libnpmpublish package',
  }
  const spec = npa(manifest.name)

  const packument = {
    _id: manifest.name,
    name: manifest.name,
    description: manifest.description,
    'dist-tags': {
      latest: '1.0.0',
    },
    versions: {
      '1.0.0': {
        _id: `${manifest.name}@${manifest.version}`,
        _nodeVersion: process.versions.node,
        _npmVersion: opts.npmVersion,
        ...manifest,
        dist: {
          shasum,
          integrity: integrity.sha512[0].toString(),
          /* eslint-disable-next-line max-len */
          tarball: 'http://mock.reg/@npmcli/libnpmpublish-test/-/@npmcli/libnpmpublish-test-1.0.0.tgz',
        },
      },
    },
    access: 'public',
    _attachments: {
      '@npmcli/libnpmpublish-test-1.0.0.tgz': {
        content_type: 'application/octet-stream',
        data: tarData.toString('base64'),
        length: tarData.length,
      },
    },
  }

  registry.nock.put(`/${spec.escapedName}`, packument).reply(201, {})

  const ret = await publish(manifest, tarData, opts)
  t.ok(ret, 'publish succeeded')
})

t.test('scoped publish - restricted access', async t => {
  const { publish } = t.mock('..')
  const registry = new MockRegistry({
    tap: t,
    registry: opts.registry,
    authorization: token,
  })
  const manifest = {
    name: '@npmcli/libnpmpublish-test',
    version: '1.0.0',
    description: 'test libnpmpublish package',
  }
  const spec = npa(manifest.name)

  const packument = {
    _id: manifest.name,
    name: manifest.name,
    description: manifest.description,
    'dist-tags': {
      latest: '1.0.0',
    },
    versions: {
      '1.0.0': {
        _id: '@npmcli/libnpmpublish-test@1.0.0',
        _nodeVersion: process.versions.node,
        _npmVersion: opts.npmVersion,
        name: '@npmcli/libnpmpublish-test',
        ...manifest,
        dist: {
          shasum,
          integrity: integrity.sha512[0].toString(),
          /* eslint-disable-next-line max-len */
          tarball: 'http://mock.reg/@npmcli/libnpmpublish-test/-/@npmcli/libnpmpublish-test-1.0.0.tgz',
        },
      },
    },
    access: 'restricted',
    _attachments: {
      '@npmcli/libnpmpublish-test-1.0.0.tgz': {
        content_type: 'application/octet-stream',
        data: tarData.toString('base64'),
        length: tarData.length,
      },
    },
  }

  registry.nock.put(`/${spec.escapedName}`, packument).reply(201, {})

  const ret = await publish(manifest, tarData, {
    ...opts,
    access: 'restricted',
  })
  t.ok(ret, 'publish succeeded')
})

t.test('retry after a conflict', async t => {
  const { publish } = t.mock('..')
  const registry = new MockRegistry({
    tap: t,
    registry: opts.registry,
    authorization: token,
  })
  const REV = '72-47f2986bfd8e8b55068b204588bbf484'
  const manifest = {
    name: 'libnpmpublish',
    version: '1.0.0',
    description: 'some stuff',
  }

  const basePackument = {
    name: 'libnpmpublish',
    description: 'some stuff',
    access: 'public',
    _id: 'libnpmpublish',
    'dist-tags': {},
    versions: {},
    _attachments: {},
  }
  const currentPackument = cloneDeep({
    ...basePackument,
    time: {
      modified: new Date().toISOString(),
      created: new Date().toISOString(),
      '1.0.1': new Date().toISOString(),
    },
    'dist-tags': { latest: '1.0.1' },
    versions: {
      '1.0.1': {
        _id: 'libnpmpublish@1.0.1',
        _nodeVersion: process.versions.node,
        _npmVersion: opts.npmVersion,
        name: 'libnpmpublish',
        version: '1.0.1',
        description: 'some stuff',
        dist: {
          shasum,
          integrity: integrity.toString(),
          tarball: 'http://mock.reg/libnpmpublish/-/libnpmpublish-1.0.1.tgz',
        },
      },
    },
    _attachments: {
      'libnpmpublish-1.0.1.tgz': {
        content_type: 'application/octet-stream',
        data: tarData.toString('base64'),
        length: tarData.length,
      },
    },
  })
  const newPackument = cloneDeep({
    ...basePackument,
    'dist-tags': { latest: '1.0.0' },
    versions: {
      '1.0.0': {
        _id: 'libnpmpublish@1.0.0',
        _nodeVersion: process.versions.node,
        _npmVersion: opts.npmVersion,
        name: 'libnpmpublish',
        version: '1.0.0',
        description: 'some stuff',
        dist: {
          shasum,
          integrity: integrity.toString(),
          tarball: 'http://mock.reg/libnpmpublish/-/libnpmpublish-1.0.0.tgz',
        },
      },
    },
    _attachments: {
      'libnpmpublish-1.0.0.tgz': {
        content_type: 'application/octet-stream',
        data: tarData.toString('base64'),
        length: tarData.length,
      },
    },
  })
  const mergedPackument = cloneDeep({
    ...basePackument,
    time: currentPackument.time,
    'dist-tags': { latest: '1.0.0' },
    versions: { ...currentPackument.versions, ...newPackument.versions },
    _attachments: { ...currentPackument._attachments, ...newPackument._attachments },
  })

  registry.nock.put('/libnpmpublish', body => {
    t.notOk(body._rev, 'no _rev in initial post')
    t.same(body, newPackument, 'got conflicting packument')
    return true
  }).reply(409, { error: 'gimme _rev plz' })

  registry.nock.get('/libnpmpublish?write=true').reply(200, {
    _rev: REV,
    ...currentPackument,
  })

  registry.nock.put('/libnpmpublish', body => {
    t.same(body, {
      _rev: REV,
      ...mergedPackument,
    }, 'posted packument includes _rev and a merged version')
    return true
  }).reply(201, {})

  const ret = await publish(manifest, tarData, opts)
  t.ok(ret, 'publish succeeded')
})

t.test('retry after a conflict -- no versions on remote', async t => {
  const { publish } = t.mock('..')
  const registry = new MockRegistry({
    tap: t,
    registry: opts.registry,
    authorization: token,
  })
  const REV = '72-47f2986bfd8e8b55068b204588bbf484'
  const manifest = {
    name: 'libnpmpublish',
    version: '1.0.0',
    description: 'some stuff',
  }

  const basePackument = {
    name: 'libnpmpublish',
    description: 'some stuff',
    access: 'public',
    _id: 'libnpmpublish',
  }
  const currentPackument = { ...basePackument }
  const newPackument = cloneDeep({
    ...basePackument,
    'dist-tags': { latest: '1.0.0' },
    versions: {
      '1.0.0': {
        _id: 'libnpmpublish@1.0.0',
        _nodeVersion: process.versions.node,
        _npmVersion: opts.npmVersion,
        name: 'libnpmpublish',
        version: '1.0.0',
        description: 'some stuff',
        dist: {
          shasum,
          integrity: integrity.toString(),
          tarball: 'http://mock.reg/libnpmpublish/-/libnpmpublish-1.0.0.tgz',
        },
      },
    },
    return output;
  };

  fileExists = (filePath: string) => {
    if (isURL(filePath)) return true;

    const normalizedFilePath = pathPosix.normalize(filePath);
    return (
      !!this._textFiles[normalizedFilePath] ||
      !!this._filesToDownload[normalizedFilePath]
    );
  };
}
