'use strict';

var assign = require('object-assign');

hexo.config.indexAnything = assign({
    templateIndex: hexo.config.indexAnything.templateIndex === null ? "index" : hexo.config.indexAnything.templateIndex,
    templateKey: hexo.config.indexAnything.templateKey === null ? "index" : hexo.config.indexAnything.templateKey,
    titleSeparator: hexo.config.indexAnything.titleSeparator === null ? " - " : hexo.config.indexAnything.titleSeparator,
  }, hexo.config.indexAnything);

hexo.extend.generator.register('indexAnything', require('./lib/generator'));