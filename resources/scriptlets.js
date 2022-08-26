// Collection of userscripts to be used for scriptlet injection on domains.
// Not something you would need (yet) unless you are a filter list author.

// Taken from https://github.com/gorhill/uBlock/blob/96343ecf1a10a24675ae8620c18d8e0742cd0b7f/assets/resources/scriptlets.js#L251
// I personally found the old json prune logger to be better on Chromium browsers, as it allows us to expand and copy json paths
/// json-prune-logger.js
/// alias jpl.js
(() => {
    const log = console.log.bind(console);
    const rawPrunePaths = '{{1}}';
    const rawNeedlePaths = '{{2}}';
    const prunePaths = rawPrunePaths !== '{{1}}' && rawPrunePaths !== ''
        ? rawPrunePaths.split(/ +/)
        : [];
    const needlePaths = rawNeedlePaths !== '{{2}}' && rawNeedlePaths !== ''
        ? rawNeedlePaths.split(/ +/)
        : [];
    const findOwner = function(root, path) {
        let owner = root;
        let chain = path;
        for (;;) {
            if ( owner instanceof Object === false ) { return; }
            const pos = chain.indexOf('.');
            if ( pos === -1 ) {
                return owner.hasOwnProperty(chain)
                    ? [ owner, chain ]
                    : undefined;
            }
            const prop = chain.slice(0, pos);
            if ( owner.hasOwnProperty(prop) === false ) { return; }
            owner = owner[prop];
            chain = chain.slice(pos + 1);
        }
    };
    const mustProcess = function(root) {
        for ( const needlePath of needlePaths ) {
            const details = findOwner(root, needlePath);
            if ( details === undefined ) { return false; }
        }
        return true;
    };
    JSON.parse = new Proxy(JSON.parse, {
        apply: function() {
            const r = Reflect.apply(...arguments);
            if ( prunePaths.length === 0 ) {
                log(location.hostname, r);
                return r;
            }
            if ( mustProcess(r) === false ) { return r; }
            for ( const path of prunePaths ) {
                const details = findOwner(r, path);
                if ( details !== undefined ) {
                    delete details[0][details[1]];
                }
            }
            return r;
        },
    });
})();

// Imported from:
// https://github.com/NanoAdblocker/NanoFilters/blob/b6a8a66b83dcf97ec35b5d9d87d0c49540387709/NanoFiltersSource/NanoResources.txt#L161
// Click elements when the documents gets ready, 1 required argument.
// selector - The selector for elements to remove, must be a plain CSS selector,
// pseudo-selectors are not supported.
/// nano-click-elements-onready.js
/// alias nceo.js
(() => {
	var selector = '{{1}}';
	if ( selector === '' || selector === '{{1}}' ) {
		return;
	}
	var click = function() {
		var elements = document.querySelectorAll(selector);
		for ( var element of elements ) {
			element.click();
		}
	};
	if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
		click();
	} else {
		addEventListener('DOMContentLoaded', click);
	}
})();