import Icons from './Utils/Icons'
import Cookie from 'js.cookie'

export default class Checkers
{

	dropdownClosure;
	allSearchedCheckedCheckbox;
	checkers;
	searchInput;

	constructor(dropdownClosure)
	{
		this.dropdownClosure = dropdownClosure;

		let owerflowedBox = this.getDropDown().getElement().find('.box-inner');
		this.allCheckedCheckbox = this.getDropDown().getElement().find('.select-all');
		this.allSearchedCheckedCheckbox = this.getDropDown().getElement().find('.select-all-searched');
		this.checkers = owerflowedBox.find('ul .checker');
		this.searchInput = this.getDropDown().getElement().find('.search-input').val(null);

		owerflowedBox.scrollTop(this.getScroll());

		this.getDropDown().getElement().find('.all-select-searched-li').hide();

		this.setUpCheckboxes();
		this.setUpCheckers();

		let _this = this;
		owerflowedBox.off('scroll.mesour-filter');
		owerflowedBox.on('scroll.mesour-filter', function () {
			_this.setScroll(jQuery(this).scrollTop());
		});

		this.setUpDropDown();
		this.setUpSearchInput();
	}

	setUpCheckboxes()
	{
		let _this = this;

		this.allCheckedCheckbox.off('change.data-grid');
		this.allCheckedCheckbox.on('change.data-grid', function(event) {
			Checkers.allCheckboxCallback.apply(this, [event])
			_this.getDropDown().save();
			_this.getDropDown().getFilter().apply();
		});

		this.allSearchedCheckedCheckbox.off('change.data-grid');
		this.allSearchedCheckedCheckbox.on('change.data-grid', function(event) {
			Checkers.allCheckboxCallback.apply(this, [event])
			_this.getDropDown().save();
			_this.getDropDown().getFilter().apply();
		});
	}

	setUpCheckers()
	{
		let _this = this;
		this.checkers.on('change', function (e, triggered) {
			let $this = jQuery(this),
				li = $this.closest('li'),
				subUl = li.find('.toggled-sub-ul');

			if ($this.is(':checked')) {
				li.addClass('li-checked');
				if (subUl.is('*')) {
					subUl.find('.checker').prop('checked', true)
						.closest('li').addClass('li-checked');
				}
			} else {
				li.removeClass('li-checked');
				if (subUl.is('*')) {
					subUl.find('.checker').prop('checked', false)
						.closest('li').removeClass('li-checked');
				}
			}

			_this.checkAllSubChecked($this);
			_this.checkAllChecked(triggered);
		});
		this.checkers.next('label').each(function () {
			let $this = jQuery(this);
			if ($this.text().length > 40) {
				$this.text($this.text().substr(0, 37) + '...');
			}
		});
	}

	setUpDropDown()
	{
		let _this = this;
		this.getDropDown().getElement().find('.close-all a').on('click', function (e) {
			e.preventDefault();
			let $this = jQuery(this);
			$this.closest('li').children('ul').find('ul').each(function () {
				let sub = jQuery(this);
				sub.slideUp();
				sub.closest('li').find('.toggle-sub-ul')
					.removeClass(_this.getDropDown().getFilter().getIconClass(Icons.ICON_MINUS))
					.removeClass('list-opened')
					.addClass(_this.getDropDown().getFilter().getIconClass(Icons.ICON_PLUS));
			});
			_this.closeSubUl('month-' + $this.closest('li').children('.toggle-sub-ul').attr('data-name').replace('year-', ''));
		});
		this.getDropDown().getElement().find('.toggle-sub-ul').on('click', function (e) {
			e.preventDefault();
			let $this = jQuery(this),
				subselect = $this.closest('li').children('ul'),
				closeAll = $this.closest('li').children('.close-all');

			if (subselect.is(':visible')) {
				subselect.slideUp();
				closeAll.hide();
				$this.removeClass(_this.getDropDown().getFilter().getIconClass(Icons.ICON_MINUS))
					.removeClass('list-opened')
					.addClass(_this.getDropDown().getFilter().getIconClass(Icons.ICON_PLUS));
				_this.closeSubUl($this);
			} else {
				subselect.slideDown();
				closeAll.show();
				$this.removeClass(_this.getDropDown().getFilter().getIconClass(Icons.ICON_PLUS))
					.addClass('list-opened')
					.addClass(_this.getDropDown().getFilter().getIconClass(Icons.ICON_MINUS));
				_this.openSubUl($this);
			}
		});
	}

	setUpSearchInput()
	{
		let _this = this;

		this.searchInput.off('keyup.filter-checkers');
		this.searchInput.on('keyup.filter-checkers', function () {
			let $this = jQuery(this),
				value = mesour.removeDiacritics($this.val().toLowerCase()),
				checkers = $this.closest('.inline-box').next('.box-inner').find('ul .checker'),
				oneHide = false;

			_this.allSearchedCheckedCheckbox.closest('li').hide();
			checkers.closest('li').show();
			checkers.closest('li').each(function () {
				let $li = jQuery(this);
				if (mesour.removeDiacritics($li.text().toLowerCase()).indexOf(value) === -1) {
					$li.hide();
					oneHide = true;
				}
			});
			if (oneHide) {
				_this.allSearchedCheckedCheckbox.closest('li').show();
			}
			_this.checkAllChecked(true);
		});
	}

	getDropDown()
	{
		return this.dropdownClosure();
	}

	checkChecked(allCheckers, masterChecker)
	{
		let allChecked = true,
			someChecked = false,
			someIndeterminate = false;

		allCheckers.each(function () {
			let $this = jQuery(this);
			if (!$this.is(':checked')) {
				if ($this.is(':indeterminate')) {
					allChecked = true;
					someIndeterminate = true;
				} else {
					allChecked = false;
				}

			} else {
				someChecked = true;
			}
		});

		if (someChecked && masterChecker.is('.checker')) {
			masterChecker.prop("indeterminate", true)
				.closest('li').children('label').addClass('active-one');
		} else if (masterChecker.is('.checker')) {
			masterChecker.prop("indeterminate", false)
				.closest('li').children('label').addClass('active-one');
		}

		if (allChecked) {
			if (someIndeterminate) {
				masterChecker.prop('checked', false)
					.prop("indeterminate", true)
					.closest('li').addClass('li-checked');
			} else {
				masterChecker.prop('checked', true)
					.prop("indeterminate", false)
					.closest('li').addClass('li-checked');
			}
		} else {
			masterChecker.prop('checked', false)
				.closest('li').removeClass('li-checked');
		}
	}

	checkAllChecked(triggered)
	{
		if (this.allSearchedCheckedCheckbox.is(':visible')) {
			this.checkChecked(this.checkers.filter(':visible'), this.allSearchedCheckedCheckbox);
		}
		this.checkChecked(this.checkers, this.allCheckedCheckbox);
		if (!triggered) {
			this.getDropDown().save();
			this.getDropDown().getFilter().apply();
		}
	}

	getChecked()
	{
		let values = [];
		this.checkers.filter('[data-value]').each(function () {
			let $this = jQuery(this);
			if ($this.is(':checked')) {
				values.push($this.attr('data-value'))
			}
		});
		return values;
	}

	check(val)
	{
		this.checkers.filter('[data-value="' + this.getDropDown().fixVariable(val) + '"]').prop('checked', true)
			.trigger('change', true);
	}

	checkAllSubChecked($checker)
	{
		let subUl = $checker.closest('.toggled-sub-ul');
		if (!subUl.is('*')) {
			return;
		}
		this.checkChecked(subUl.children('li').children('.checker'), subUl.closest('li').children('.checker'));

		let subSubUl = subUl.closest('li').parent('ul').closest('li');
		if (!subSubUl.is('*')) {
			return;
		}
		this.checkChecked(subSubUl.children('ul').children('li').children('.checker'), subSubUl.children('.checker'));
	}

	closeSubUl($el)
	{
		let val = Cookie.get(this.getDropDown().getCookieName()),
			current = typeof val === 'string' ? jQuery.parseJSON(val) : {};

		if (typeof $el === 'object') {
			delete current[$el.attr('data-name')];
		} else {
			for (let l in current) {
				if (!current.hasOwnProperty(l)) {
					continue;
				}
				if (l.substr(0, 10) === $el) {
					delete current[l];
				}
			}
		}

		Cookie.set(this.getDropDown().getCookieName(), JSON.stringify(current));
	}

	openSubUl($el)
	{
		let val = Cookie.get(this.getDropDown().getCookieName()),
			current = typeof val === 'string' ? jQuery.parseJSON(val) : {};

		current[$el.attr('data-name')] = 1;
		Cookie.set(this.getDropDown().getCookieName(), JSON.stringify(current));
	}

	setScroll(scrollTop)
	{
		Cookie.set(this.getDropDown().getFilter().getName() + '-' + this.getDropDown().getName() + '-scroll', scrollTop);
	}

	getScroll()
	{
		let val = Cookie.get(this.getDropDown().getFilter().getName() + '-' + this.getDropDown().getName() + '-scroll');
		return val ? parseInt(val) : 0;
	}

	static allCheckboxCallback(e)
	{
		let $this = jQuery(this);
		let visible = !$this.hasClass('select-all-searched') ? '' : ':visible';
		if ($this.is(':checked')) {
			$this.closest('li').addClass('li-checked')
				.closest('ul').find('.checker' + visible).prop('checked', true)
				.trigger('change', true);
		} else {
			$this.closest('li').removeClass('li-checked')
				.closest('ul').find('.checker' + visible).prop('checked', false)
				.trigger('change', true);
		}
	}

}