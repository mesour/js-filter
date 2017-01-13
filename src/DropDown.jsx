import Checkers from './Checkers'
import Constants from './Utils/Constants'
import Icons from './Utils/Icons'
import CustomFilter from './CustomFilter'
import Translator from './Utils/Translator'
import Cookie from 'js.cookie'

export default class DropDown
{

	element;
	name;
	filterName;
	referenceData;
	referenceSetting;
	type;
	translates = {};
	checkers;
	customFilter;
	mouseIn = false;
	filterClosure;
	isTimestamp = false;

	constructor(element, name, filterName, filterClosure)
	{
		this.element = element;
		this.name = name;
		this.filterName = filterName;
		this.filterClosure = filterClosure;
		this.referenceSetting = element.attr('data-reference-settings');
		this.referenceData = this.getFilter().getReferencedData(this.referenceSetting, name);
		this.type = element.attr('data-type');

		this.cookieName = this.getFilter().getName() + '-' + name + '-checkers';

		let translatesInput = element.find('[data-translates]');
		this.translates = translatesInput.is('*') ? jQuery.parseJSON(translatesInput.val()) : [];

		element.find('.dropdown-submenu')
			.on('mousemove', function() {
				let $this = jQuery(this);
				let windowWidth = jQuery(window).width();
				let width = $this.width();
				let offset = $this.closest('.dropdown-menu').offset();

				if (windowWidth - (offset.left + width) < 250) {
					$this.addClass('pull-left');
				} else {
					$this.removeClass('pull-left');
				}
			});

		this.create();

		this.customFilter = new CustomFilter(() => {
			return this;
		});
		this.checkers = new Checkers(() => {
			return this;
		});

		element.on({
			mouseenter: () => {
				this.mouseIn = true;
			},
			mouseleave: () => {
				this.mouseIn = false;
			}
		});

		jQuery('.mesour-filter-modal').on({
			mouseenter: () => {
				this.mouseIn = true;
			},
			mouseleave: () => {
				this.mouseIn = false;
			}
		});

		jQuery('html').on('click.filter-el-' + name, () => {
			if (this.isOpened() && !this.mouseIn) {
				this.close();
			}
		});

		element.children('button').on('click', (e) => {
			e.preventDefault();
			this.getFilter().closeAll(element);
			this.toggle(element);
		});

		element.find('.reset-filter').on({
			click: () => {
				this.unsetValues('custom');
				this.update();
				this.save();
				this.getFilter().apply();
			},
			mouseenter: function () {
				jQuery(this).removeClass('btn-success').addClass('btn-danger')
					.find('[data-filter-icon]').hide()
					.filter('[data-filter-icon="reset"]').show();
			},
			mouseleave: function () {
				jQuery(this).removeClass('btn-danger').addClass('btn-success')
					.find('[data-filter-icon]').hide()
					.filter('[data-filter-icon="has-custom"]').show();
			}
		});

		element.find('.close-filter').on('click', (e) => {
			e.preventDefault();
			this.update();
			this.close();
		});

		this.update();
	}

	getFilter()
	{
		return this.filterClosure();
	}

	fixVariable(variable)
	{
		if (variable === null) {
			return Constants.VALUE_NULL;
		} else if (variable === true) {
			return Constants.VALUE_TRUE;
		} else if (variable === false) {
			return Constants.VALUE_FALSE;
		}
		return variable;
	}

	translateVariable(variable)
	{
		if (variable === null) {
			return '<i>' + Translator.translate('empty') + '</i>';
		} else if (variable === true) {
			return '<i>' + Translator.translate('true') + '</i>';
		} else if (variable === false) {
			return '<i>' + Translator.translate('false') + '</i>';
		} else if (this.translates[variable]) {
			return this.translates[variable];
		}
		return Translator.translate(variable);
	}

	destroy()
	{
		let ul = this.element.find('.box-inner').find('ul');
		ul.find('li:not(.all-select-li):not(.all-select-searched-li)').remove();
	}

	apply(open)
	{
		DropDown.applyDropDown(this.getFilter().getName(), this.getFilter().getDropDownLink(), open);
	}

	create(gridData, isAgain)
	{
		gridData = !gridData ? this.getFilter().getData() : gridData;
		if (!gridData && !this.referenceData) return;

		let values = {};
		if (this.referenceData) {
			for (let x in this.referenceData) {
				if (!this.referenceData.hasOwnProperty(x)) {
					continue;
				}
				let text = this.referenceData[x],
					id;
				if (typeof text === 'object') {
					let obj = text;
					text = obj.text;
					id = obj.id;
				}

				let fixedVariable = this.fixVariable(text);
				values[fixedVariable] = {
					val: id || (this.referenceSetting === Constants.PREDEFINED_KEY ? x : fixedVariable),
					translated: id ? text : this.translateVariable(text),
					keys: [0]
				}
			}
		} else {
			for (let x = 0; x < gridData.length; x++) {
				if (typeof gridData[x][this.name] === 'undefined') {
					throw new Error('MesourFilterDropDownException: Column "' + this.name + '" does not exists in data.');
				}
				if (!values[gridData[x][this.name]]) {
					let fixedVariable = this.fixVariable(gridData[x][this.name]);
					values[fixedVariable] = {
						val: fixedVariable,
						translated: this.translateVariable(gridData[x][this.name]),
						keys: [x]
					};
				} else {
					values[gridData[x][this.name]].keys.push(x);
				}
			}
		}

		if (!this.type) {
			let ul = this.element.find('.box-inner').find('ul');
			for (let y in values) {
				let valueItem = values[y];
				if (!valueItem.val && Number(valueItem.val) !== 0) continue;

				let li = jQuery('<li>'),
					id = this.name + ((valueItem.val && typeof valueItem.val.replace === 'function') ? valueItem.val.replace(' ', '') : valueItem.val);
				li.append('<input type="checkbox" class="checker" data-value="' + valueItem.val + '" id="' + id + '">');
				li.append('&nbsp;');
				li.append('<label for="' + id + '">' + valueItem.translated + '</label>');
				ul.append(li);
			}
		} else if (this.type === 'date') {
			let years = [],
				months = {},
				special = {};
			for (let y in values) {
				if (!values[y].val) continue;

				this.isTimestamp = isNaN(values[y].val);

				if (values[y].val) {
					if (values[y].val === Constants.VALUE_NULL || values[y].val === Constants.VALUE_TRUE || values[y].val === Constants.VALUE_FALSE) {
						special[values[y].val] = values[y];
						continue;
					}
				}
				let timestamp = this.isTimestamp ? mesour.datetime.strtotime(values[y].val) : values[y].val;
				let year = mesour.datetime.date('Y', timestamp);
				let month = mesour.datetime.date('n', timestamp);
				let day = mesour.datetime.date('j', timestamp);
				if (years.indexOf(year) === -1) {
					years.push(year)
				}
				if (!months[year]) {
					months[year] = {};
					months[year]['months'] = [];
					months[year]['days'] = {};
				}
				if (months[year]['months'].indexOf(month) === -1) {
					months[year]['months'].push(month);
				}
				if (!months[year]['days'][month]) {
					months[year]['days'][month] = [];
				}
				if (months[year]['days'][month].indexOf(day) === -1) {
					months[year]['days'][month].push(day);
				}
			}
			years.sort(function (a, b) {
				return b - a;
			});

			let ul = this.element.find('.box-inner').find('ul');
			for (let i in special) {
				if (!special.hasOwnProperty(i)) {
					continue;
				}
				let li = jQuery('<li>'),
					id = this.name + ((special[i].val && typeof special[i].val.replace === 'function') ? special[i].val.replace(' ', '') : special[i].val);
				li.append('<input type="checkbox" class="checker" data-value="' + special[i].val + '" id="' + id + '">');
				li.append('&nbsp;');
				li.append('<label for="' + id + '">' + special[i].translated + '</label>');
				ul.append(li);
			}

			let val = Cookie.get(this.cookieName),
				checkersInfo = typeof val === 'string' ? jQuery.parseJSON(val) : {};

			for (let a in years) {
				if (!years.hasOwnProperty(a)) {
					continue;
				}
				let yearName = 'year-' + years[a];

				let isYearOpened = checkersInfo[yearName] ? true : false;

				let year_li = jQuery('<li>');
				year_li.append('<span class="' + this.getFilter().getIconClass(
						isYearOpened ? Icons.ICON_MINUS : Icons.ICON_PLUS
					) + ' toggle-sub-ul" data-name="' + yearName + '"></span>');
				year_li.append('&nbsp;');
				year_li.append('<input type="checkbox" class="checker">');
				year_li.append('&nbsp;');
				year_li.append('<label>' + years[a] + '</label>');
				year_li.append('<span class="close-all">(<a href="#">' + Translator.translate('closeAll') + '</a>)</span>');
				let month_ul = jQuery('<ul class="toggled-sub-ul">');
				year_li.append(month_ul);

				if (isYearOpened) {
					month_ul.show();
					year_li.find('.close-all').show();
				}

				months[years[a]].months.sort(function (a, b) {
					return a - b
				});
				let month = months[years[a]].months;
				for (let b in month) {
					let monthName = 'month-' + years[a] + '-' + month[b];

					let isMonthOpened = checkersInfo[monthName] ? true : false;

					let month_li = jQuery('<li>');
					month_li.append('<span class="' + this.getFilter().getIconClass(
							isMonthOpened ? Icons.ICON_MINUS : Icons.ICON_PLUS
						) + ' toggle-sub-ul" data-name="' + monthName + '"></span>');
					month_li.append('&nbsp;');
					month_li.append('<input type="checkbox" class="checker">');
					month_li.append('&nbsp;');
					month_li.append('<label>' + Translator.translateMonth(month[b]) + '</label>');
					month_ul.append(month_li);
					let days_ul = jQuery('<ul class="toggled-sub-ul">');
					month_li.append(days_ul);

					if (isMonthOpened) {
						days_ul.show();
					}

					months[years[a]].days[month[b]].sort(function (a, b) {
						return a - b
					});
					let days = months[years[a]].days[month[b]];
					for (let c in days) {
						let this_time = mesour.datetime.strtotime(years[a] + '-' + month[b] + '-' + days[c]);
						let date_text = this.isTimestamp ? mesour.datetime.date(this.getFilter().getPhpDateFormat(), this_time) : this_time;
						let day_li = jQuery('<li>');
						day_li.append('<span class="' + this.getFilter().getIcons().getIconPrefix() + '">&nbsp;</span>');
						day_li.append('<input type="checkbox" class="checker" data-value="' + date_text + '">');
						day_li.append('&nbsp;');
						day_li.append('<label>' + days[c] + '</label>');
						days_ul.append(day_li);
					}
				}
				ul.append(year_li);
			}
		}
		if (isAgain) {
			this.checkers = new Checkers(() => {
				return this;
			});
		}
	}

	getName()
	{
		return this.name;
	}

	getType()
	{
		return this.type;
	}

	getCookieName()
	{
		return this.cookieName;
	}

	getElement()
	{
		return this.element;
	}

	getValues(valType)
	{
		let val = this.getFilter().getValues(this.name);
		if (!valType) {
			return val;
		} else {
			if (!val[valType]) {
				return {};
			} else {
				return val[valType];
			}
		}
	}

	setValues(newValues, valType)
	{
		let val = this.getFilter().getValues(this.name);
		val[valType] = newValues;
		this.getFilter().setValues(val, this.name);
	}

	unsetValues(valType)
	{
		let val = this.getFilter().getValues(this.name);
		delete val[valType];
		this.getFilter().setValues(val, this.name);
	}

	update()
	{
		let values = this.getValues(),
			toggle_button = this.element.find('.dropdown-toggle'),
			menu = this.element.find('.dropdown-menu'),
			first_submenu = menu.children('.dropdown-submenu');
		toggle_button.find('[data-filter-icon="check"]').hide();
		first_submenu.find('[data-filter-icon]').closest('button').hide();
		this.element.removeClass('active-item').removeClass('active-checkers');

		if (values) {
			if (values.custom && values.custom.operator) {
				toggle_button.find('[data-filter-icon="check"]').show();
				this.element.addClass('active-item');
				first_submenu.find('[data-filter-icon]').closest('button').show();
			}
			if (values.checkers && typeof values.checkers[0] !== 'undefined') {
				toggle_button.find('[data-filter-icon="check"]').show();
				this.element.addClass('active-checkers');
				for (let x = 0; x < values.checkers.length; x++) {
					this.checkers.check(values.checkers[x]);
				}
			}
		}
	}

	toggle()
	{
		if (this.isOpened()) {
			this.close();
		} else {
			this.open();
		}
	}

	isOpened()
	{
		return this.element.hasClass('open');
	}

	open()
	{
		this.getFilter().closeAll(this.element);
		this.element.addClass('open');
		this.apply({
			id: this.name,
			opened: 1
		});
	}

	close()
	{
		this.update();
		this.element.removeClass('open');
		this.apply({
			id: this.name,
			opened: 0
		});
	}

	save()
	{
		let checked = this.checkers.getChecked();
		if (checked.length > 0) {
			this.setValues(this.getFilter().generateNextPriority(), 'priority');
			this.setValues(checked, 'checkers');
			this.setValues(this.type !== 'date' ? 'text' : 'date', 'type');
		} else {
			this.unsetValues('priority');
			this.unsetValues('checkers');
		}
		//_this.getFilter().filterCheckers();
		//_this.close();
	}

	static applyDropDown(filterName, href, filterData)
	{
		if (filterData !== '') {
			let name = filterData.id;
			let opened = filterData.opened;
			Cookie.set(filterName + '-' + name, opened);
		}
	}

}