/*global alert */
(function ($) {
	var APP = {
		ui: {}
	};

	var hasOwn = Object.hasOwnProperty;

	var BOT_NR = 6;

	var parseUrl = function (url) {
		// Lazy-init this DOM element, and share it between
		// calls using closure.
		var a = document.createElement('a');

		var realParseUrl = function (url) {
			a.href = url;
			// http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-a-element
			// http://url.spec.whatwg.org/#urlutils
			if (!a.hostname) {
				throw new Error('Cannot parse url');
			}
			return {
				host: a.host,
				post: a.post,
				hostname: a.hostname
			};
		};

		// Next call, bypass this
		parseUrl = realParseUrl;
		return parseUrl(url);
	};

	var natsort = function (a, b) {
		return a.localeCompare(b, 'en', { numeric: true });
	};

	var cvnbotListOpening = 'Currently monitoring:';

	// To disambiguate an item that's split over two lines and an item that perfectly
	// ends at the previous line and a new one starting on the next, we need to now
	// what an item looks like. Specifically, the suffixes it can have.
	// This all because irc (or at least CVNBot) usually (always?) loses the space
	// at the end of a line.
	var rCvnbotListItemEnd = /\.(wikibooks|wikinews|wikimedia|wikipedia|wikiquote|wikisource|wikiversity|wikivoyage|wiktionary)$/;

	/**
	 * @param {string} chatlog Piece of chatlog containing the response of "CVNBot list"
	 */
	var convertCvnbotList = function (chatlog, nickname) {
		var sep, opening, end, extracted, idx, channels;
		// Example:
		// "Example2: Currently monitoring: ab.wikipedia af.wiktionary ang.wikiq\
		//  18:05 Example2: uote es.wikinews es.wikiquote (Total: 142 wikis)"
		sep = null;
		opening = cvnbotListOpening;
		end = '(Total';
		extracted = '';
		channels = [];
		chatlog = chatlog.trim().split('\n');
		chatlog.forEach(function (line) {
			var prefix, main, idx;
			idx = line.indexOf(opening);
			if (idx !== -1) {
				main = line.slice(idx + opening.length);
				// Opening: Try and find out what the nick/message separator is (e.g. ": ")
				prefix = line.slice(0, idx);
				idx = prefix.indexOf(nickname);
				if (idx !== -1) {
					sep = prefix.slice(idx + nickname.length);
				}
			} else {
				// Continuation
				if (sep !== null) {
					main = line.slice(line.indexOf(nickname) + nickname.length);
					main = main.slice(main.indexOf(sep) + sep.length);
				}
			}

			main = main.trim();

			if (rCvnbotListItemEnd.test(main)) {
				main += ' ';
			}

			extracted += main;
		});
		idx = extracted.indexOf(end);
		if (idx !== -1) {
			extracted = extracted.slice(0, idx);
		}
		return extracted.trim().split(' ');
	};

	/**
	 * @return {string} Source channel name
	 */
	function getSourceChannelForWiki(customChannels, dbname, wiki) {
		if (customChannels[dbname]) {
			return customChannels[dbname];
		}
		// Based on wmf-config/CommonSettings.php
		matches = wiki.hostname.match(/^(.+).org$/);
		if (!matches) {
			return null;
		}
		return matches[1];
	}

	function warn() {
		if (window.console && console.warn) {
			console.warn.apply(console, arguments);
		}
	}

	/**
	 * @return {Promise}
	 * @promise {Array} dbnames
	 */
	APP.getAllDblist = function () {
		return $.ajax('./var/all.dblist').then(function (data) {
			return String(data).trim().split('\n');
		});
	};

	/**
	 * @return {Promise}
	 * @promise {Array} dbnames
	 */
	APP.getLargeDblist = function () {
		return $.ajax('./var/large.dblist').then(function (data) {
			return String(data).trim().split('\n');
		});
	};

	/**
	 * @return {Promise}
	 * @promise {Object} channels Channel keyed by dbname
	 */
	APP.getCustomChannels = function () {
		return $.ajax('./var/InitialiseSettings.php.txt').then(function (data) {
			var before, after, arrayStart, arrayEnd, arrayLines, channels;
			// Hacky PHP-parser:
			// 'wmgRC2UDPPrefix' => array(
			//     'default' => false,
			//     'wikidatawiki' => "#wikidata.wikipedia\t",
			// );
			before = 'wmgRC2UDPPrefix\' => ';
			after = '],';
			arrayStart = data.indexOf(before);
			if (arrayStart === -1) {
				return $.Deferred().reject(new Error('wmgRC2UDPPrefix start not found'));
			}
			data = data.slice(arrayStart + before.length);
			arrayEnd = data.indexOf(after);
			if (arrayEnd === -1) {
				return $.Deferred().reject(new Error('wmgRC2UDPPrefix end not found'));
			}
			arrayLines = data.slice(0, arrayEnd).trim().split('\n');
			channels = {};
			arrayLines.forEach(function (line) {
				var matches = line.match(/\s*'([a-z0-9_]+)'\s*=>\s*"#([a-z0-9\-\.]+)\\t"/);
				if (matches && matches[1] && matches[2]) {
					channels[ matches[1] ] = matches[2];
				}
			});
			return channels;
		});
	};

	/**
	 * @return {Promise}
	 * @promise {Array} channels
	 */
	APP.getExcludedChannels = function () {
		return $.ajax({
			url: 'https://meta.wikimedia.org/w/api.php',
			data: {
				format: 'json',
				formatversion: '2',
				action: 'query',
				prop: 'revisions',
				titles: 'Countervandalism Network/Bots',
				redirects: '1',
				rvprop: 'content'
			},
			dataType: 'jsonp',
			cache: true
		}).then(function (data) {
			return data.query.pages[0].revisions[0].content;
		}).then(function (content) {
			var channels = [];
			// On [[m:CVN/Bots]], the list of source channels (e.g. "en.wikipedia") is
			// in the table cell right before the cell that contains the
			// feed channel(s), starting with "#" (e.g. "#cvn-wp-en")
			var listPattern = /\|([^|]+)\|\s*#/g;
			var lists = content.match(listPattern);
			if (!lists) {
				return channels;
			}
			var rChannel = /[\w]+\.wik[\w]+/;
			lists.forEach(function (list) {
				list.trim().split(/[\s\|\n]+/).forEach(function (channel) {
					if (rChannel.test(channel)) {
						channels.push(channel);
					}
				});
			});
			return channels;
		});
	};

	/**
	 * @return {Promise}
	 * @promise {Array} channels
	 */
	APP.getIncludedChannels = function () {
		// These channels overrride the normal definition of "small",
		// but #cvn-sw wants to keep these eventhough they are not "small".
		return $.Deferred().resolve([
				'meta.wikimedia',
				'mediawiki.wikipedia',
				'species.wikimedia',
				'incubator.wikimedia'
		]);
	};

	/**
	 * @return {Promise}
	 * @promise {Object} wikis Wiki site descriptors keyed by dbname
	 */
	APP.getWikis = function () {
		return $.when(
			$.ajax({
				url: 'https://meta.wikimedia.org/w/api.php',
				data: {
					format: 'json',
					action: 'sitematrix'
				},
				dataType: 'jsonp',
				cache: true
			}),
			APP.getLargeDblist()
		).then(function (ajax, largewikiDbnames) {
			// ajax = [ responseData, statusText, jqXhr ]
			var data = ajax[0];
			var ret = {
				goodWikis: {},
				badWikis: {
					closed: {},
					private: {},
					fishbowl: {},
					large: {}
				}
			};
			if (!data.sitematrix) {
				return $.Deferred().reject(new Error('SiteMatrix not found'));
			}
			$.each(data.sitematrix, function (key, group) {
				var sites, siteWikis;
				if (key === 'count') {
					return;
				}
				if (key === 'specials') {
					sites = group;
				} else {
					sites = group.site;
				}
				$.each(sites, function (i, site) {
					var wiki = {
						url: site.url,
						hostname: parseUrl(site.url).hostname
					};
					if (site.closed !== undefined) {
						ret.badWikis.closed[site.dbname] = wiki;
					} else if (site.private !== undefined) {
						ret.badWikis.private[site.dbname] = wiki;
					} else if (site.fishbowl !== undefined) {
						ret.badWikis.fishbowl[site.dbname] = wiki;
					} else if (largewikiDbnames.indexOf(site.dbname) !== -1) {
						ret.badWikis.large[site.dbname] = wiki;
					} else {
						ret.goodWikis[site.dbname] = wiki;
					}
				});
			});
			return ret;
		});
	};

	/**
	 * @param {Object} channelsByBot Arrays of channels keyed by bot nickname
	 */
	APP.getAnalysis = function (channelsByBot) {
		// All channels currently monitored
		// Keyed by channel, value of 1 bot name
		var monitoredInBot = {};

		// Suggested for removal
		// - Already monitored by another SWMT bot
		//   Keyed by channel, value list of two or more bot names.
		var dupesByChannel = {};

		// - Not needed (locked, private/fishbowl, or large)
		//   Keyed by bot, value is a list where
		//   each value is an object with a 'channel' and 'reason' key
		var redundantByBot = {};

		// Suggested for addition
		// - Needed but not currently monitored
		var unmonitored = [];

		return $.when(
			APP.getWikis(),
			APP.getCustomChannels(),
			APP.getExcludedChannels(),
			APP.getIncludedChannels()
		).then(function (wikis, customChannels, excludedChannels, includedChannels) {
			var i;
			// Map of dbname => wiki object
			// Good wikis are:
			// - public (not private or fishbowl)
			// - open (not locked)
			// - small (not large)
			var goodWikis = wikis.goodWikis;
			// Map of bad-reason => dbname = wiki object
			var badWikis = wikis.badWikis;

			// Using jQuery.map to filter out null values
			var goodChannels = $.map(goodWikis, function (wiki, dbname) {
				var channel = getSourceChannelForWiki(customChannels, dbname, wiki);
				if (!channel) {
					// Ignore this wiki, given we don't know its channel name
					// we can't know if a bot is monitoring it or how
					// to add it to the monitor.
					warn('Analysis: Unable to determine source channel for ' + dbname);
					return;
				}
				return channel;
			});
			// Add the list of wikis we intentionally monitor within SWMT
			// regardless of whether they are are "bad" (eg. too large)
			includedChannels.forEach(function (channel) {
				if (goodChannels.indexOf(channel) === -1) {
					goodChannels.push(channel);
				}
			});

			$.each(channelsByBot, function (bot, channels) {
				var redundant = [];
				channels.forEach(function (channel) {
					var badReason, reason;
					if (!hasOwn.call(monitoredInBot, channel)) {
						monitoredInBot[channel] = bot;
					} else {
						if (!dupesByChannel[channel]) {
							dupesByChannel[channel] = [ monitoredInBot[channel], bot ];
						} else {
							dupesByChannel[channel].push(bot);
						}
					}

					if (goodChannels.indexOf(channel) === -1) {
						// Try to figure out why this is not a good one
						reason = 'unknown';
						for (badReason in badWikis) {
							$.each(badWikis[badReason], function (dbname, wiki) {
								var badChannel = getSourceChannelForWiki(customChannels, dbname, wiki);
								if (badChannel === channel) {
									reason = badReason;
								}
							});
						}
						redundant.push({ channel: channel, reason: reason });
					}
				});

				if (redundant.length) {
					redundantByBot[bot] = redundant;
				}
			});

			for (i = 0; i < goodChannels.length; i++) {
				if (!hasOwn.call(monitoredInBot, goodChannels[i])) {
					unmonitored.push(goodChannels[i]);
				}
			}

			return {
				// Currently monitored
				channelsByBot: channelsByBot,
				monitored: Object.keys(monitoredInBot),
				dupesByChannel: dupesByChannel,
				redundantByBot: redundantByBot,
				unmonitored: unmonitored
			};
		});
	};

	APP.ui.save = function (channelsByBot) {
		try {
			localStorage.setItem('cvnMegaTableInput', JSON.stringify(channelsByBot));
		} catch (e) {
			// Storage may be full or disabled. Ignore.
		}
	};

	APP.ui.load = function (elements) {
		var data;
		try {
			data = localStorage.getItem('cvnMegaTableInput');
		} catch (e) {
			// Storage may be disabled, e.g. private mode. Ignore.
		}
		if (!data) {
			return;
		}
		var channelsByBot = JSON.parse(data);
		var bots = Object.keys(channelsByBot).sort(natsort);
		if (bots.length > BOT_NR) {
			throw new Error('Bot index out of range');
		}
		$.each(bots, function (i, bot) {
			elements.swNicks[i + 1].val(bot);
			elements.swLists[i + 1].val(channelsByBot[bot].join(' '));
		});
	};

	/**
	 * @return {jQuery}
	 */
	APP.ui.makeForm = function () {
		var i,
			input,
			elements = {};

		function validateSwField() {
			var $list, $nick, nickInput,
				$el = $(this),
				nr = $el.data('cvn-sw-nr');

			if (this.type === 'text') {
				// Nick change event
				$nick = $el;
				$list = elements.swLists[nr];
			} else {
				// Channels change event
				$list = $el;
				$nick = elements.swNicks[nr];
			}

			nickInput = $nick.get(0);

			if ($nick.val().length) {
				// Clear error
				nickInput.setCustomValidity('');
			} else if ($list.val().indexOf(cvnbotListOpening) !== -1) {
				nickInput.setCustomValidity('Channel list contains chatlog, please provide a username so that I can extract the list');
			}
		}

		/**
		 * @param {jQuery.Event} e
		 */
		function handleOutputTextClick(e) {
			if (this.select) {
				this.select();
			}
		}

		/**
		 * @param {jQuery.Event} e
		 */
		elements.$form = $('#cvn-form').on('submit', function (e) {
			var i, nickInput, list, nick, channels, channelsByBot;
			e.preventDefault();
			elements.$spinner.show();

			channelsByBot = {};
			for (i = 1; i <= BOT_NR; i++) {
				list = elements.swLists[i].val().trim();
				nick = elements.swNicks[i].val().trim();
				if (!list && !nick) {
					continue;
				}
				if (nick && list.indexOf(cvnbotListOpening) !== -1) {
					channels = convertCvnbotList(list, nick);
				} else if (list.length) {
					channels = list.split(/\s+/);
				} else {
					// Avoid "" -> [ "" ]
					channels = [];
				}
				if (!nick) {
					nick = '(Bot_' + i + ')';
				}
				channelsByBot[nick] = channels;
				if (channels.length) {
					// Show normalised input back to the user
					elements.swLists[i].val(channels.join(' '));
				}
			}

			APP.ui.save(channelsByBot);

			$.when(
				APP.getAnalysis(channelsByBot),
				elements.$output.slideDown('slow').promise()
			).done(function (analysis) {
				elements.$spinner.hide();

				function makeListItems(channels) {
					return $.map(channels, function (channel) {
						var node = document.createElement('li');
						if (channel.channel && channel.reason) {
							node.textContent = channel.channel + ' (' + channel.reason + ')';
						} else {
							node.textContent = channel;
						}
						return node;
					});
				}

				function getListItems(root) {
					var nodes;
					if (Array.isArray(root)) {
						return makeListItems(root);
					}
					nodes = [];
					$.each(root, function (label, data) {
						var items = getListItems(data);
						if (items.length) {
							nodes.push(
								$('<li>')
									.text(label)
									.append(
										$('<ul>').append(items)
									)
							);
						}
					});
					return nodes;
				}

				function makeTable(data) {
					var nodes = [];
					$.each(data);
				}

				function processList(data, $target, panelType) {
					var nodes = getListItems(data);
					$target.find('ul')
						.empty()
						.append(nodes.length ? nodes : $('<p>').addClass('text-muted').text('Nothing!'));

					$target.find('textarea').val(JSON.stringify(data, null, 4));

					if (nodes.length) {
						$target.attr('class', 'panel panel-' + panelType);
					} else {
						$target.attr('class', 'panel panel-success');
					}
				}

				processList(analysis.monitored, elements.results.current, 'success');

				elements.results.current.find('ul').prepend(
					$('<li>Statistics</li>').append($('<ul>').append($.map(analysis.channelsByBot, function (channels, bot) {
						return $('<li>')
							.text(bot + ' ')
							.append(
								$('<span>')
									.addClass('badge')
									.text(channels.length)
							);
					})))
				);

				processList(
					{
						'Wikis that no longer need to be monitored (locked, private/fishbowl, or too large)': analysis.redundantByBot,
						'Wikis monitored more than once': analysis.dupesByChannel
					},
					elements.results.redundant,
					'warning'
				);

				processList(analysis.unmonitored, elements.results.unmonitored, 'danger');

				elements.$output.get(0).scrollIntoView();
			})
			.fail(function (e) {
				elements.$spinner.hide();
				alert('Analysis failed: ' + e);
			});
		});

		elements.swNicks = [];
		elements.swLists = [];

		for (i = 1; i <= BOT_NR; i++) {
			elements.swNicks[i] = input = $('<input type="text"/>')
				.addClass('form-control')
				.data('cvn-sw-nr', i)
				.attr({
					id: 'cvn-sw' + i + '-nick',
					placeholder: 'Enter nick name...'
				})
				.on('input', validateSwField);

			$('<div>')
				.addClass('form-group')
				.append(
					$('<label>')
						.addClass('control-label col-sm-2')
						.attr('for', 'cvn-sw' + i + '-nick')
						.text('Group ' + i + ' bot'),
					$('<div>')
						.addClass('col-sm-10')
						.append(input)
				)
				.appendTo(elements.$form);

			elements.swLists[i] = input = $('<textarea>')
				.addClass('form-control')
				.data('cvn-sw-nr', i)
				.prop({
					id: 'cvn-sw' + i + '-list',
					placeholder: 'Enter wiki list...\n\n… <CVNBot#> Currently monitoring: foo.ex\n… <CVNBot#> ample, bar.example',
					rows: 4
				})
				.on('input', validateSwField);

			$('<div>')
				.addClass('form-group')
				.append(
					$('<label>')
						.addClass('control-label col-sm-2')
						.attr('for', 'cvn-sw' + i + '-list')
						.text('Group ' + i + ' channels'),
					$('<div>')
						.addClass('col-sm-10')
						.append(input)
				)
				.appendTo(elements.$form);
		}

		elements.$button = $('<button type="submit"/>')
			.addClass('btn btn-primary')
			.text('Analyse');

		elements.$spinner = $('<div class="spinner"></div>')
			.hide();

		$('<div>')
			.addClass('form-group')
			.append(
				$('<div>')
					.addClass('col-sm-offset-2 col-sm-10')
					.append(
						elements.$button,
						elements.$spinner
					)
			)
			.appendTo(elements.$form);

		elements.$output = $('#cvn-output');

		elements.results = {
			current: elements.$output.find('#cvn-output-current'),
			redundant: elements.$output.find('#cvn-output-redundant'),
			unmonitored: elements.$output.find('#cvn-output-unmonitored')
		};

		elements.results.current.find('textarea')
		.add(
			elements.results.redundant.find('textarea')
		)
		.add(
			elements.results.unmonitored.find('textarea')
		)
		.on('click', handleOutputTextClick);

		return elements;
	};

	$(function () {
		var elements = APP.ui.makeForm();
		APP.ui.load(elements);
	});

	// Expose
	window.APP = APP;
}(jQuery));
