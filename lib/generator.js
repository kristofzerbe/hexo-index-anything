'use strict';

// require all the things
const _       = require('lodash')
const moment  = require('moment')
const S       = require('string')
const path    = require('path')

module.exports = function(locals) {

    var config = this.config

    let IndexAnything

    /**
     * Index Constructor
     * An index is a group of posts sorted according to the value of a single front
     * matter variable. For example, if you add an `author` variable to all your
     * posts, then an `author` index contains all posts with that variable, grouped
     * according to the value of the `author` variable.
     *
     * @class
     * @classdesc group of posts sorted according to a single front matter variable
     *
     * @constructor
     * @param {String} index
     * @param {String} path
     */
    IndexAnything = function(index, path) {
      this.index = index
      this.path = path
      this.posts = {}
    }
    
    /**
     * push
     * add a post to this index. Only posts with this index set will be added,
     * others will be discarded
     *
     * @param {hexoPost} post - a post as created by hexo generator
     */
    IndexAnything.prototype.push = function(post) {
      let index = this
      // discard posts where the index is not set
      if (!_.has(post, index.index)) {
        return
      }
      // deal with indexes containing multiple values (like tags)
      let values = _.flatten([post[index.index]])
      _.each(values, function(value) {
        value = S(value).slugify().s
        index.posts[value] = index.posts[value] || []
        index.posts[value].push(post)
      })
    }
    
    /**
     * return a path with or without asset folder
     *
     * @param {String} key the name of this index
     * @return String
     */
    IndexAnything.prototype.getPath = function(key) {
      // if `post_asset_folder` is set, place indexes in folders
      var p;
      if (config.post_asset_folder && key !== "index") {
        p = path.join(
          S(this.path).slugify().s,
          key,
          'index.html'
        )
      }
      // otherwise make the file name match the index name
      p = path.join(
        S(this.path).slugify().s,
        key + '.html'
      )
      return p.replace("\\","/");
    }
    
    /**
     * getList
     * generates the the html page, which would list each of the pages created by
     * this instance. so the list page for an 'authors' index, would list the
     * authors, with links to pages listing their respective articles
     *
     * @return Array
     */
    IndexAnything.prototype.getList = function() {
      let index = this
      // generate an array to be used as `posts` in template
      return _.map(_.keys(index.posts), function(key) {
        return {
          title: S(key).humanize().titleCase().s,
          date: moment(),
          path: index.getPath(key)
        }
      })
    }
    
    /**
     * getPages
     * return an array of page objects representing
     *   - each of the keys belonging to this index
     *   - one list, containing links to all of those keys
     *
     * @return Array
     */
    IndexAnything.prototype.getPages = function() {
      let index = this
      // note the filename for list is going to be index
      index.posts.index = index.getList()
      return _.map(index.posts, function(posts, key) {
        // add handy methods for templates
        posts = _(posts)
        let indexString = S(index.index).humanize().titleCase().s
        let keyString = S(key).humanize().titleCase().s
        let title = indexString
        let template = config.indexAnything.templateIndex || 'index'
        if (key !== 'index') { 
          title += config.indexAnything.titleSeparator + keyString
          template = config.indexAnything.templateKey || 'index'
        }
        return {
          data: {
            title: title,
            index: indexString,
            key: keyString,
            date: moment(),
            posts: posts
          },
          path: index.getPath(key),
          layout: template
        }
      })
    }
    
    let indexes = []
    // created index instances according to config
    _.each(config.indexAnything.variables, function(path, index) {
      indexes.push(new IndexAnything(index, path))
    })

    var posts = locals.posts.sort(config.index_generator.order_by);
    // push each post to each index
    _.each(posts.data, function(post) {
      _.each(indexes, function(index) {
        index.push(post)
      })
    })
    // hexo generator expects an array of pages, see `Index.prototype.getPages`
    return _.flatten(_.map(indexes, function(index) {
      return index.getPages()
    }))

};