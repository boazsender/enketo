'use strict';

/**
 * Transforms XForm label and hint with a subset of Markdown into HTML
 * Supported:
 * - _, __, *, **, [](), #, ##, ###, ####, #####, 
 * - span tags and html-encoded span tags,
 * - unordered markdown lists and order markdown lists (one level)
 * - newline characters
 * 
 * Also HTML encodes any unsupported HTML tags for safe use inside web-based clients
 * 
 * @param  {string} text label or hint text content
 * @return {string}      transformed text content
 */


function markdownToHtml( text ) {
    var html = text
        // html encoding of < for safety
        .replace( /</gm, '&lt;' )
        // html encoding of > for safety
        .replace( />/gm, '&gt;' )
        // strong
        .replace( /__(.*)__/gm, '<strong>$1</strong>' )
        .replace( /\*\*(.*)\*\*/gm, '<strong>$1</strong>' )
        // emphasis
        .replace( /_([^\s].*)_/gm, '<em>$1</em>' )
        .replace( /\*([^\s].*)\*/gm, '<em>$1</em>' )
        // links
        .replace( /\[([^\]]*)\]\(([^\)]+)\)/gm, '<a href="$2" target="_blank">$1</a>' )
        // headers
        .replace( /(#+)([^\n]*)\n/gm, _createHeader )
        // unordered lists (in JS $ matches end of line as well as end of string)
        .replace( /(\n(\*|\+|-)(.*))+$/gm, _createUnorderedList )
        // ordered lists (in JS $ matches end of line as well as end of string)
        .replace( /(\n([0-9]+\.)(.*))+$/gm, _createOrderedList )
        // span
        .replace( /&lt;\s?span(.*)&gt;(.+)&lt;\/\s?span\s?&gt;/gm, _createSpan )
        // paragraphs
        .replace( /([^\n]+)\n/gm, _createParagraph );
    return html;
}

function _createHeader( match, hashtags, content ) {
    var level = hashtags.length;
    return '<h' + level + '>' + content.replace( /#+$/, '' ).trim() + '</h' + level + '>';
}

function _createUnorderedList( match ) {
    var items = match.replace( /\n(\*|\+|-)(.*)/gm, _createItem );
    return '<ul>' + items + '</ul>';
}

function _createOrderedList( match ) {
    var items = match.replace( /\n([0-9]+\.)(.*)/gm, _createItem );
    return '<ol>' + items + '</ol>';
}

function _createItem( match, bullet, content ) {
    return '<li>' + content.trim() + '</li>';
}

function _createParagraph( match, line ) {
    var trimmed = line.trim();
    if ( /^<\/?(ul|ol|li|h|p|bl)/i.test( trimmed ) ) {
        return line;
    }
    return '<p>' + trimmed + '</p>';
}

function _createSpan( match, attributes, content ) {
    var sanitizedAttributes = _sanitizeAttributes( attributes );
    return '<span' + sanitizedAttributes + '>' + content + '</span>';
}

function _sanitizeAttributes( attributes ) {
    var styleMatches = attributes.match( /( style=(["'])[^"']*\2)/ );
    var style = ( styleMatches && styleMatches.length ) ? styleMatches[ 0 ] : '';
    return style;
}

module.exports = {
    toHtml: markdownToHtml
};
