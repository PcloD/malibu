/**
 *	@class HistoryRouter
 *
 *	@description <p>A router that handles browser/app history. 
 *	Works with either the History API or just internally within the app.</p>
 *	<p>In most cases - NOT TO BE used directly, it is used internally by {@link Application} instead.</p>
 */
var HistoryRouter = function (app, params) {

	var disableHistoryAPI = (params && params.disableHistoryAPI) || !Simplrz.history;

	var rootUrl = document.location.protocol + '//' + (document.location.hostname || document.location.host);
	if(document.location.port) rootUrl += ":" + document.location.port;
	app.navigate = new Trigger();
	app.hijackLinks = new Trigger();

	Application.history = [];

	var hijackLinks = function (element) {

		var base = document.querySelector('base');
		base = (base && base.getAttribute('href')) ? base.getAttribute('href') : '/';

		if(base == '/') base = '';
		if(base[base.length-1] == '/') base = base.substring(0, base.length - 1);

		app.baseUrl = base;

		var allLinksSelector = 'a[href]';
		var allLinks = (element || document).querySelectorAll(allLinksSelector);
		
		allLinks = Array.prototype.slice.call(allLinks);

		if(element && element.nodeName.toLowerCase() == "a") {
			allLinks.unshift(element);	
		}

		for (var i = 0; i < allLinks.length; i++) {
			var link = allLinks[i];

			var url = link.getAttribute('href');
			var target = link.getAttribute('target');
			var hj = link.getAttribute('data-hj');

			if(url == null || url.indexOf(':') > -1 || target == '_blank' || hj == "no") {
				// Skip absolute URLs, those that have no URL, a _blank target 
				// and those that are explicitely set to not be hijacked
				// (this is done by adding an attribute like this: data-hj='no')
				// console.log('HistoryRouter.hijackLinks: skipping', url);
				continue;
			}
			
			if (!link.hijacked) {
				link.hijacked = true;

				link.originalHref = link.getAttribute('href') || "";
				link.hijackedHref = base + "/" + link.getAttribute('href');

				if(link.hijackedHref.indexOf('//') == 0) link.hijackedHref = link.hijackedHref.substring(1); 
				// normalize the URL, so it doesn't start with double slashes

				var cb = function (e) {
					if(e) e.preventDefault();
					app.navigate.trigger(this.hijackedHref);
				}

				if(Simplrz.touch) {
					link.removeAttribute('href');
				}

				link.addEventListener('click', cb);
			}
		}
	};

	var notify = function(href) {

		var r = {};

		if(disableHistoryAPI)  {

			r.route = href || '';
			
		} else {

			var qs = document.location.href.indexOf('?');
			var hs = document.location.href.indexOf('#');

			var route = document.location.href;

			if(qs > -1) route = route.substring(0, qs);
			if(hs > -1) route = route.substring(0, hs);
			r.route = route.substring(rootUrl.length + 1 + app.baseUrl.length);			

		}

		r.parts = r.route.split('/');

		// Get rid of all trailing stuff
		while(r.parts[0] == '') r.parts.shift();
		while(r.parts[r.parts.length - 1] == '') r.parts.pop();

		r.lastPart = r.parts[r.parts.length - 1];

		if(r.route == app.route.value.route) return;
		Application.history.push(r);
		app.route.value = r;
	}

	if(!disableHistoryAPI) {
		window.addEventListener('popstate', function(e) {
			notify();
		});
	}

	app.hijackLinks.on(hijackLinks);

	var nc;

	app.setNavigateCondition = function(c) {
		nc = c;
	}

	app.clearNavigateCondition = function() {
		nc = null;
	}

	app.navigate.on(function(href) {
		if(!nc || nc()) {
			history.pushState(null, null, href);
			notify();
		}
	});

	return {

		init: function () {
			hijackLinks();
			if (!disableHistoryAPI) {
				notify();
			} else {
				var home, qs = document.location.search;

				if(params && params.home) home = params.home;

				if(qs.indexOf('=') > -1) {
					var aq = qs.substring(1).split('&');
					aq.forEach(function(q) {
						if(q.indexOf('id=') > -1) {
							home = q.split('=')[1];
						}
					});
				} else if(qs) {
					home = qs.substring(1);
				}

				// console.log('home', qs, home);

				notify(home || '');
			}
		}
	}
};