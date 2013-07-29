jquery = require 'jquery'
po = require 'node-po'

$ = jquery.create()

attrRegex = /{{('|"|&quot;)(.*?)\1\|translate}}/g

module.exports = (grunt) ->
    grunt.registerMultiTask 'nggettext_extract', 'Extract strings from views', () ->
        @files.forEach (file) ->
            failed = false
            catalog = new po()

            strings = {}

            addString = (file, string, plural = null) ->
                if !strings[string]
                    strings[string] = new po.Item()
                item = strings[string]
                item.msgid = string
                item.references.push(file) if file not in item.references
                if plural && plural != ''
                    if item.msgid_plural && item.msgid_plural != plural
                        grunt.log.error "Incompatible plural definitions for #{string}: #{item.msgid_plural} / #{plural} (in: #{item.references.join(", ")})"
                        failed = true
                    item.msgid_plural = plural
                    item.msgstr = ["", ""]

            file.src.forEach (input) ->
                src = grunt.file.read(input)
                $(src).find('*').andSelf().each (index, n) ->
                    node = $(n)
                    if node.attr('translate')
                        str = node.html()
                        plural = node.attr('translate-plural')
                        addString(input, str, plural)

                while matches = attrRegex.exec(src)
                    addString(input, matches[2])


            for key, string of strings
                catalog.items.push(string)

            if !failed
                grunt.file.write(file.dest, catalog.toString())

module.exports.regex = attrRegex
