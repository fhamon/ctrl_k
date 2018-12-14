(function ($, S) {

	'use strict';

	var win = $(window);

	var placeholders = [
		'Switch to...',
		'Jump to...',
		'Hyperdrive to...'
	];

	var LETTER_K = 75;

	var sections = [
		{
			name: 'Blueprints Pages',
			path: '/blueprints/pages/',
			system: true,
			devOnly: true
		},
		{
			name: 'Blueprints Sections',
			path: '/blueprints/sections/',
			system: true,
			devOnly: true
		},
		{
			name: 'Blueprints Data Sources',
			path: '/blueprints/datasources/',
			system: true,
			devOnly: true
		},
		{
			name: 'Blueprints Events',
			path: '/blueprints/events/',
			system: true,
			devOnly: true
		},
		{
			name: 'System Authors',
			path: '/system/authors/',
			system: true
		},
		{
			name: 'System Preferences',
			path: '/system/preferences/',
			system: true,
			devOnly: true
		},
		{
			name: 'System Extensions',
			path: '/system/extensions/',
			system: true,
			devOnly: true
		},
		{
			name: 'System Log',
			path: 'system/log/',
			system: true,
			devOnly: true
		}
	];

	if (!!S.Author) {
		sections.push({
			name: S.Author.username,
			path: '/system/authors/edit/' + S.Author.id,
			system: true
		});
	}

	var sels = {
		ctn: '#ctrl_k',
		input: '.js-ctrl-k-input'
	};

	var close = function () {
		var ctn = $(sels.ctn);
		var input = ctn.find(sels.input);
		ctn.removeClass('is-visible').removeClass('has-results');
		input.val('').trigger('input').blur();
	};

	var open = function () {
		var ctn = $(sels.ctn);
		var input = ctn.find(sels.input);
		input.attr('placeholder', placeholders[Math.floor(Math.random() * placeholders.length)]);
		ctn.addClass('is-visible');
		input.focus();
	};

	var onKeydown = function (event) {
		if (event.which === LETTER_K && (!!event.ctrlKey || !!event.metaKey) && !!sections.length) {
			var ctn = $(sels.ctn);

			if (!!ctn.hasClass('is-visible')) {
				close();
			} else {
				open();
			}

			event.stopPropagation();
			return event.preventDefault();
		}

		if (event.which === 27 && !!$(event.target).is(sels.input)) {
			close();
		}
	};

	var render = function () {
		var ctn = $('<div />').attr('id', 'ctrl_k');
		var input = $('<input />').addClass(sels.input.replace('.', '')).attr({
			type: 'text'
		});
		ctn.append([input]);
		S.Elements.body.append(ctn);

		input.autocomplete({
			hint: false,
			openOnFocus: true,
			autoselect: true
		}, [{
				source: function (query, cb) {
					query = query.toLowerCase();

					var matches = [];
					var ctn = $(sels.ctn);
					var newMode = query.match(/(new ?)[a-z 0-9]*/);
					var editMode = query.match(/(edit ?)[a-z 0-9]*/);

					query = !!newMode && newMode.length === 2 ? query.replace(newMode[1], '') : query;
					query = !!editMode && editMode.length === 2 ? query.replace(editMode[1], '') : query;

					$.each(sections, function (index, element) {
						if (element.name.toLowerCase().indexOf(query) >= 0 && (!element.devOnly || S.Author.userType === 'developer')) {
							element.new = !!newMode && newMode.length === 2;
							element.edit = !!editMode && editMode.length === 2;
							if (!element.edit || !element.system) {
								matches.push(element);
							}
						}
					});

					ctn[!!matches.length ? 'addClass' : 'removeClass']('has-results');

					cb(matches);
				},
				templates: {
					suggestion: function(suggestion) {
						return suggestion.name;
					}
				}
		}]).on('autocomplete:selected', function(event, suggestion, dataset, context) {
			var url = S.Context.get('symphony');

			if (!!suggestion.edit && (!!S.Author && S.Author.userType === 'developer')) {
				url += '/blueprints/sections/edit/' + suggestion.id + '/';
			} else{
				if (!!suggestion.system) {
					url += suggestion.path;
				} else {
					url += '/publish/' + suggestion.handle + '/';
				}

				url = !!suggestion.new ? url + 'new/' : url;
			}

			close();
			window.location.href = url;
		}).on('autocomplete:close', function () {
			$(sels.ctn).removeClass('has-results');
		}).on('autocomplete:empty', function () {
			$(sels.ctn).removeClass('has-results');
		});

	};

	var fetch = function (cb) {
		$.get(S.Context.get('symphony') + '/ajax/sections/', function (data) {
			sections = sections.concat(data.sections);
			cb();
		});
	};

	var init = function () {
		if (!!window.parent.Symphony.Extensions.ctrl_k) {
			return;
		}

		fetch(function () {
			render();
			win.on('keydown', onKeydown);
			$(sels.ctn).on('click', close);
			$(sels.input).on('click', function (event) {
				event.stopPropagation();
				return event.preventDefault();
			});
		});

		var registerOne = function (link) {
			if (!!link.name && !!link.path) {
				link.notSection = true;
				sections.push(link);
				return true;
			} else {
				return false;
			}
		};

		// Register ctrl + k
		S.Extensions.ctrl_k = {
			registerLink: function (links) {
				if (typeof links === 'object') {
					registerOne(links);
					return;
				}

				$.each(links, function (index, element) {
					registerOne(element);
				});
			},
			open: open,
			close: close
		};
	};

	$(init);
	
})(window.jQuery, window.Symphony);
