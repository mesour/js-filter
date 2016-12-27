import Constants from './Utils/Constants'
import DropDown from './DropDown'
import Icons from './Utils/Icons'
import Cookie from 'js.cookie'

export default class Filter
{

	name;
	dropdowns = {};
	valuesInput;
	dropDownLink;
	icons;
	data = [];
	phpDateFormat;
	jsDateFormat;
	modalElement;

	constructor(filterName, element)
	{
		this.name = filterName;
		this.valuesInput = element;
		this.dropDownLink = element.attr('data-dropdown-link');
		this.icons = new Icons(element);
		this.data = jQuery.parseJSON(element.attr('data-mesour-data'));
		this.phpDateFormat = element.attr('data-mesour-date');
		this.jsDateFormat = element.attr('data-mesour-js-date');
		this.modalElement = $('[data-mesour-modal=' + this.name + '-modal]');

		let resetButton = jQuery('.full-reset[data-filter-name="' + filterName + '"]');

		resetButton.on('click', (e) => {
			e.preventDefault();
			jQuery.each(this.getDropdowns(), function (key, dropdown) {
				dropdown.unsetValues('custom');
				dropdown.unsetValues('priority');
				dropdown.unsetValues('checkers');
				dropdown.update();
				dropdown.getFilter().filterCheckers();
			});
			this.apply();
		});

		let _this = this;
		jQuery('.dropdown[data-filter-name="' + filterName + '"]').each(function () {
			let $this = $(this),
				name = $this.attr('data-filter');
			_this.dropdowns[name] = new DropDown($this, name, _this.name, function() {
				return _this;
			});
			$this.data('grid-filter-dropdown', _this.dropdowns[name]);
		});

		this.filterCheckers();
	}

	apply()
	{
		Filter.applyFilter(this.name, this.valuesInput.val());
	}

	getIconClass(iconType)
	{
		return this.icons.getIconClass(iconType);
	}

	getIcons()
	{
		return this.icons;
	}

	getModalElement()
	{
		return this.modalElement;
	}

	getDropdowns()
	{
		return this.dropdowns;
	}

	getDropdown(name)
	{
		return this.dropdowns[name];
	}

	getDropDownLink()
	{
		return this.dropDownLink;
	}

	getName()
	{
		return this.name;
	}

	getData()
	{
		return this.data;
	}

	getPhpDateFormat()
	{
		return this.phpDateFormat;
	}

	closeAll(notThis)
	{
		for (let x in this.dropdowns) {
			if (!this.dropdowns.hasOwnProperty(x)) {
				continue;
			}
			this.dropdowns[x].update();
		}
		let _this = this;
		this.valuesInput.find('.dropdown').each(function () {
			let $this = jQuery(this);
			if (!notThis || $this[0] !== notThis[0]) {
				$this.removeClass('open');
				Cookie.set(_this.name + '-' + $this.attr('data-filter'), 0);
			}
		});
	}

	getReferencedData(reference, columnName)
	{
		if (!reference) return null;

		let referencesData = this.valuesInput.attr('data-references'),
			output = [];

		if (referencesData) {
			let refData = jQuery.parseJSON(referencesData);
			if (reference === Constants.PREDEFINED_KEY) {
				if (!refData[reference] || !refData[reference][columnName]) {
					return null;
				}
				output = refData[reference][columnName];
				return !output || (output instanceof Array && !output.length) ? null : output;
			} else {
				let reference = jQuery.parseJSON(reference);

				if (!refData[reference['table']]) {
					return null;
				}
				refData = refData[reference['table']];
				for (let x = 0; x < refData.length; x++) {
					let item = refData[x];
					output.push(refData[x][reference['column']]);
				}
				return !output.length ? null : output;
			}
		}
		return null;
	}

	getValues(name)
	{
		let val = this.valuesInput.val();
		val = val.length === 0 ? {} : jQuery.parseJSON(val);
		if (!name) {
			return val;
		} else {
			if (!val[name]) {
				return {};
			} else {
				return val[name];
			}
		}
	}

	setValues(newValues, name)
	{
		let oldValues = this.valuesInput.val().length > 0 ? jQuery.parseJSON(this.valuesInput.val()) : {};
		if (oldValues instanceof Array) {
			oldValues = {};
		}
		oldValues[name] = newValues;

		this.valuesInput.val(JSON.stringify(oldValues));
	}

	refreshPriorities()
	{
		let _currentValues = this.getValues();
		let _usedPriorities = {};
		for (let x in _currentValues) {
			if (!_currentValues.hasOwnProperty(x)) {
				continue;
			}
			_usedPriorities[_currentValues[x].priority] = x;
		}

		let keys = [];
		for (let k in _usedPriorities) {
			if (_usedPriorities.hasOwnProperty(k)) {
				keys.push(k);
			}
		}
		keys.sort();

		let priority = 1;
		for (let i = 0; i < keys.length; i++) {
			let l = keys[i];
			if (_currentValues[_usedPriorities[l]].priority) {
				_currentValues[_usedPriorities[l]].priority = priority;
				priority++;
			}
		}
		this.valuesInput.val(JSON.stringify(_currentValues));
	}

	generateNextPriority()
	{
		this.refreshPriorities();
		let currentValues = this.getValues();
		let usedPriorities = [];
		for (let x in currentValues) {
			if (!currentValues.hasOwnProperty(x)) {
				continue;
			}
			usedPriorities.push(currentValues[x].priority);
		}
		if (usedPriorities.length > 0) {
			let nextPriority = 1;
			for (let y = 0; y < usedPriorities.length; y++) {
				if (usedPriorities[y] > nextPriority) {
					nextPriority = usedPriorities[y] + 1;
				} else if (usedPriorities[y] === nextPriority) {
					nextPriority++;
				}
			}
			return nextPriority;
		} else {
			return 1;
		}
	}

	filterData(key, valuesArr)
	{
		let data = this.getData(),
			output = [];
		for (let x in data) {
			if (!data.hasOwnProperty(x)) {
				continue;
			}
			if (valuesArr.indexOf(data[x][key]) !== -1) {
				output.push(data[x]);
			}
		}
		return output;
	}

	filterCheckers()
	{
		let currentValues = this.getValues(),
			usedPriorities = {};

		for (let z in currentValues) {
			if (!currentValues.hasOwnProperty(z)) {
				continue;
			}
			usedPriorities[currentValues[z].priority] = z;
		}

		let keys = [];
		for (let k in usedPriorities) {
			if (usedPriorities.hasOwnProperty(k)) {
				keys.push(k);
			}
		}
		keys.sort();

		let usedDropdowns = {},
			newData = this.getData();
		for (let i = 0; i < keys.length; i++) {
			let l = keys[i];
			usedDropdowns[usedPriorities[l]] = true;
			if (!this.dropdowns[usedPriorities[l]]) {
				continue;
			}
			this.dropdowns[usedPriorities[l]].destroy();
			this.dropdowns[usedPriorities[l]].create(newData, true);
			this.dropdowns[usedPriorities[l]].update();
			if (currentValues[usedPriorities[l]].checkers && currentValues[usedPriorities[l]].checkers.length > 0) {
				newData = this.filterData(usedPriorities[l], currentValues[usedPriorities[l]].checkers);
			}
		}
		for (let x in this.dropdowns) {
			if (!this.dropdowns.hasOwnProperty(x)) {
				continue;
			}
			let dropdown = this.dropdowns[x];
			if (usedDropdowns[dropdown.getName()]) continue;
			this.dropdowns[x].destroy();
			this.dropdowns[x].create(newData, true);
			this.dropdowns[x].update();
		}
	}

	static applyFilter(filterName, filterData)
	{
		filterData = jQuery.parseJSON(filterData);
		filterData = {filterData: filterData};
		let created = mesour.url.createLink(filterName, 'applyFilter', filterData, true);
		jQuery.post(created[0], created[1]).complete(mesour.redrawCallback);
	}

}