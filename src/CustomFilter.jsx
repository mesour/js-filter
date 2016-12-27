import Icons from './Utils/Icons';

export default class CustomFilter
{

	dropdownClosure;
	modalName;

	constructor(dropdownClosure)
	{
		this.dropdownClosure = dropdownClosure;
		this.modalName = this.getModalElement().attr('data-mesour-modal');

		let el = this.getDropDown().getElement().find('.mesour-open-modal'),
			_this = this;

		el.off('click.m_-custom-filter');
		el.on('click.m_-custom-filter', function (e) {
			_this.handleOpenButton($(this), e);
		});

		el = this.getModalElement().find('.save-custom-filter');
		let eventName = 'click.m_-custom-filter-' + _this.getDropDown().getName();

		el.off(eventName);
		el.on(eventName, function (e) {
			if (_this.getModalElement().find('[data-name]').val() !== _this.getDropDown().getName()) {
				return;
			}
			_this.handleSaveButton($(this), e);
		});
	}

	handleOpenButton($this, e)
	{
		e.preventDefault();

		let inputValues = [$this.attr('data-first-value'), $this.attr('data-second-value')];
		let types = [$this.attr('data-type-first'), $this.attr('data-type-second')];
		let operator = $this.attr('data-operator');

		let values = this.getDropDown().getValues('custom');
		if ($this.hasClass('edit-filter') && values) {
			operator = values.operator;
			inputValues = [values.val1, values.val2];
			types = [values.how1, values.how2];
		}

		for (let i = 0; i < inputValues.length; i++) {
			let value = inputValues[i],
				input = this.getModalElement().find('.filter-value-' + (i + 1));
			input.closest('.input-group').find('[data-icon="calendar"]').addClass(this.getDropDown().getFilter().getIconClass(Icons.ICON_CALENDAR));
			input.attr('data-date-format', this.getDropDown().getFilter().getJsDateFormat());
			if (value) {
				if (typeof value === 'string' && value.split('-').length !== 3) {
					input.val(value);
					input.removeAttr('data-date-defaultDate');
				} else {
					if (typeof value === 'string' && value.split('-').length === 3) {
						value = [value];
					}
					input.val(value[0]);
					input.attr('data-date-defaultDate', value[0]);
				}
			} else {
				input.val(null);
			}
		}

		for (let j = 0; j < types.length; j++) {
			let type = types[j],
				input = this.getModalElement().find('.filter-how-' + (j + 1));
			if (type) {
				input.val(type);
			} else {
				input.val(null);
			}
		}

		if (operator === 'or') {
			this.getModalElement().find('input[name="operator"][value=or]').prop('checked', true);
		} else {
			this.getModalElement().find('input[name="operator"][value=and]').prop('checked', true);
		}

		this.checkDateFilter();

		this.getModalElement().find('[data-name]').val(this.getDropDown().getName());
		window.mesour.modal.onShown(this.getModalName(), () => {
			this.getModalElement().find('.filter-value-1').focus();
		});
		window.mesour.modal.show(this.getModalName());
	}

	getModalName()
	{
		return this.modalName;
	}

	checkDateFilter()
	{
		let inputs = this.getModalElement().find('.filter-value-1, .filter-value-2'),
			inputGroup = inputs.closest('.input-group');
		if (this.getDropDown().getType() === 'date') {
			inputGroup.removeClass('without-datepicker');

			this.getModalElement().find('.input-group-addon').show();

			this.refreshPickers();

			inputs.on('keydown.mesour-filter', function (e) {
				e.preventDefault();
				if (e.keyCode === 46 || e.keyCode === 8) {
					$(this).val(null);
				}
			});
		} else {
			inputGroup.addClass('without-datepicker');

			this.getModalElement().find('.input-group-addon').hide();

			this.destroyPickers();

			inputs.off('keydown.mesour-filter');
		}
	}

	handleSaveButton()
	{
		let modalName = this.getModalElement().attr('data-mesour-modal'),
			internalValues = {
				how1: this.getModalElement().find('.filter-how-1').val(),
				how2: this.getModalElement().find('.filter-how-2').val(),
				val1: this.getModalElement().find('.filter-value-1').val(),
				val2: this.getModalElement().find('.filter-value-2').val(),
				operator: this.getModalElement().find('input[name="operator"]:checked').val()
			};

		if (internalValues.how1.length === 0) {
			alert('Please select some value in first select.');
			this.getModalElement().find('.filter-how-1').focus();
			return;
		}
		if (internalValues.val1.length === 0) {
			alert('Please insert some value for first text input.');
			this.getModalElement().find('.filter-value-1').focus();
			return;
		}
		if (internalValues.how2.length !== 0 && internalValues.val2.length === 0) {
			alert('Please insert some value for second input.');
			this.getModalElement().find('.filter-value-2').focus();
			return;
		}
		this.getDropDown().setValues(internalValues, 'custom');
		this.getDropDown().setValues(this.getDropDown().getType() !== 'date' ? 'text' : 'date', 'type');
		window.mesour.modal.hide(this.getModalName());
		this.getDropDown().update();
		this.getDropDown().save();
		this.getDropDown().getFilter().apply();
	}

	getDropDown()
	{
		return this.dropdownClosure();
	}

	getModalElement()
	{
		return this.getDropDown().getFilter().getModalElement();
	}

	refreshPickers()
	{
		let pickers = this.getModalElement().find('.filter-datepicker1, .filter-datepicker2');
		window.mesour.datetime.picker.destroy(pickers);
		window.mesour.datetime.picker.create(pickers);
	}

	destroyPickers()
	{
		let pickers = this.getModalElement().find('.filter-datepicker1, .filter-datepicker2');
		window.mesour.datetime.picker.destroy(pickers);
	}

}