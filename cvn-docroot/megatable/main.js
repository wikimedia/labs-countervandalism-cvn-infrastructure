/*global alert */
(function ($) {
	var APP = {
		ui: {}
	};

	var hasOwn = Object.hasOwnProperty;

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
		// "SampleBot-sw2: Currently monitoring: ab.wikipedia af.wiktionary ang.wikiq\
		//  18:05 SampleBot-sw2: uote es.wikinews es.wikiquote (Total: 142 wikis)"
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
			before = 'wmgRC2UDPPrefix\' => array(';
			after = '),';
			arrayStart = data.indexOf(before);
			if (arrayStart === -1) {
				return $.Deferred().reject();
			}
			data = data.slice(arrayStart + before.length);
			arrayEnd = data.indexOf(after);
			if (arrayEnd === -1) {
				return $.Deferred().reject();
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
		return $.ajax('./var/non-swmt.txt').then(function (data) {
			return String(data).trim().split('\n').filter(function (line) {
				line = line.trim();
				return line.length && line[0] !== '#';
			});
		});
	};

	/**
	 * @return {Promise}
	 * @promise {Object} wikis Wiki site descriptors keyed by dbname
	 */
	APP.getWikis = function () {
		return $.when(
			$.ajax({
				url: '//meta.wikimedia.org/w/api.php?format=json&action=sitematrix',
				dataType: 'jsonp',
				cache: true
			}),
			APP.getLargeDblist()
		).then(function (ajax, largewikiDbnames) {
			// ajax = [ responseData, statusText, jqXhr ]
			var data = ajax[0];
			var wikis = {};
			if (!data.sitematrix) {
				return $.Deferred().reject();
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
					if (
						site.closed === undefined &&
						site.private === undefined &&
						site.fishbowl === undefined &&
						largewikiDbnames.indexOf(site.dbname) === -1
					) {
						wikis[site.dbname] = {
							url: site.url,
							hostname: parseUrl(site.url).hostname
						};
					}
					return null;
				});
			});
			return wikis;
		});
	};

	/**
	 * @return {Promise}
	 * @promise {Array} channels IRC source channel names for irc.wikimedia.org (without "#")
	 */
	APP.getSourceChannels = function () {
		return $.when(
			APP.getWikis(),
			APP.getCustomChannels(),
			APP.getExcludedChannels()
		).then(function (wikis, customChannels, excludedChannels) {
			// Using jQuery.map to filter out null values
			return $.map(wikis, function (wiki, dbname) {
				var matches, channel;
				if (customChannels[dbname]) {
					channel = customChannels[dbname];
				} else {
					// Based on wmf-config/CommonSettings.php
					matches = wiki.hostname.match(/^(.+).org$/);
					if (!matches) {
						return;
					}
					channel = matches[1];
				}
				if (excludedChannels.indexOf(channel) !== -1) {
					return;
				}
				return channel;
			});
		});
	};

	/**
	 * @param {Object} channelsByBot Arrays of channels keyed by bot nickname
	 */
	APP.getAnalysis = function (channelsByBot) {
		// All channels currently monitored
		// Keyed by channel, value of 1 bot name
		var monitoredInBot = {};

		// channels monitored by more than one bot.
		// Keyed by channel, value list of two or more bot names.
		var dupesByChannel = {};

		// channels needlessly monitored
		// Keyed by bot
		var redundantByBot = {};

		var unmonitored = [];

		// Get list of channels that should be monitored (all public wikis)
		return APP.getSourceChannels().then(function (allchannels) {
			var i, len;

			$.each(channelsByBot, function (bot, channels) {
				var i, len, channel,
					redundant = [];

				for (i = 0, len = channels.length; i < len; i++) {
					channel = channels[i];

					if (!hasOwn.call(monitoredInBot, channel)) {
						monitoredInBot[channel] = bot;
					} else {
						if (!dupesByChannel[channel]) {
							dupesByChannel[channel] = [ monitoredInBot[channel], bot ];
						} else {
							dupesByChannel[channel].push(bot);
						}
					}

					if (allchannels.indexOf(channel) === -1) {
						redundant.push(channel);
					}
				}

				if (redundant.length) {
					redundantByBot[bot] = redundant;
				}
			});

			for (i = 0, len = allchannels.length; i < len; i++) {
				if (!hasOwn.call(monitoredInBot, allchannels[i])) {
					unmonitored.push(allchannels[i]);
				}
			}

			return {
				monitored: Object.keys(monitoredInBot),
				dupesByChannel: dupesByChannel,
				redundantByBot: redundantByBot,
				unmonitored: unmonitored
			};
		});
	};

	APP.ui.save = function (channelsByBot) {
		localStorage.setItem('cvnMegaTableInput', JSON.stringify(channelsByBot));
	};

	APP.ui.load = function (elements) {
		var data = localStorage.getItem('cvnMegaTableInput');
		if (!data) {
			return;
		}
		var channelsByBot = JSON.parse(data);
		var bots = Object.keys(channelsByBot).sort();
		if (bots.length > 5) {
			throw new Error('Bot index must be in range 1 - 5');
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
		elements.$form = $('#cvn-form').on('submit', function (e) {
			var i, nickInput, list, nick, channels, channelsByBot;
			e.preventDefault();
			elements.$spinner.show();

			channelsByBot = {};
			for (i = 1; i <= 5; i++) {
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
					nick = 'Bot-sw' + i;
				}
				channelsByBot[nick] = channels;
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
						node.textContent = channel;
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
						.append(nodes);

					$target.find('textarea').val(JSON.stringify(data, null, 4));

					if (nodes.length) {
						$target.attr('class', 'panel panel-' + panelType);
					} else {
						$target.attr('class', 'panel panel-default');
					}
				}

				processList(analysis.monitored, elements.results.current, 'success');

				processList(
					{
						'Monitored wikis that no longer need to be monitored (locked, removed, too large, source channel changed, already monitored outside #cvn-sw, ..)': analysis.redundantByBot,
						'Wikis monitored more than once': analysis.dupesByChannel
					},
					elements.results.redundant,
					'warning'
				);

				processList(analysis.unmonitored, elements.results.unmonitored, 'danger');

				elements.$output.get(0).scrollIntoView();
			})
			.fail(function () {
				elements.$spinner.hide();
				alert('Analysis failed');
			});
		});

		elements.swNicks = [];
		elements.swLists = [];

		for (i = 1; i <= 5; i++) {
			elements.swNicks[i] = input = $('<input type="text"/>')
				.addClass('form-control')
				.data('cvn-sw-nr', i)
				.attr({
					id: 'cvn-sw' + i + '-nick',
					placeholder: 'Bot ' + i
				})
				.on('input', validateSwField);

			$('<div>')
				.addClass('form-group')
				.append(
					$('<label>')
						.addClass('control-label col-sm-2')
						.attr('for', 'cvn-sw' + i + '-nick')
						.text('Bot ' + i + ' nick'),
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
					placeholder: 'aa.wikipedia ab.wiktionary ...',
					rows: 4
				})
				.on('input', validateSwField);

			$('<div>')
				.addClass('form-group')
				.append(
					$('<label>')
						.addClass('control-label col-sm-2')
						.attr('for', 'cvn-sw' + i + '-list')
						.text('Bot ' + i + ' channels'),
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

		return elements;
	};

	$(function () {
		var elements = APP.ui.makeForm();
		APP.ui.load(elements);
	});

	// Expose
	window.APP = APP;
}(jQuery));
