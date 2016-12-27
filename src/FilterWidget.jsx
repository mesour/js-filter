import Filter from './Filter'
import Cookie from 'js.cookie'

export default class FilterWidget
{

	filters = {};

	getFilter(name)
	{
		if (!this.filters[name]) {
			throw new Error('Filter with name ' + name + ' not exist.');
		}
		return this.filters[name];
	}

	ready()
	{
		let _this = this;
		jQuery('[data-mesour-filter]').each(function () {
			let $this = jQuery(this),
				name = $this.attr('data-mesour-filter'),
				filter = $this.data('mesour-filter-instance');

			if (!filter) {
				_this.filters[name] = filter = new Filter(name, $this);
				$this.data('mesour-filter-instance', filter);
			}
			jQuery.each(filter.getDropdowns(), function (key, dropdown) {
				dropdown.destroy();
				dropdown.create();
				dropdown.update();
				dropdown.getFilter().filterCheckers();
				if (Cookie.get(name + '-' + dropdown.getName())) {
					dropdown.open();
				}
			});
		});
	}

}