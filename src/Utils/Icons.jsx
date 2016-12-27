export default class Icons
{

	icons = {};
	iconPrefix;

	constructor(element)
	{
		this.iconPrefix = element.attr('data-icon-prefix');
		this.icons = jQuery.parseJSON(element.attr('data-icons'));
	}

	getIconClass(iconType)
	{
		if (!this.icons[iconType]) {
			throw new Error('Icon type ' + iconType + ' not exists.');
		}
		return this.iconPrefix + this.icons[iconType];
	}

	getIconPrefix()
	{
		return this.iconPrefix;
	}

	static get ICON_ITEM_ACTIVE()
	{
		return 'itemIsActive';
	}

	static get ICON_EDIT_CUSTOM()
	{
		return 'editCustom';
	}

	static get ICON_REMOVE_CUSTOM()
	{
		return 'removeCustom';
	}

	static get ICON_PLUS()
	{
		return 'plus';
	}

	static get ICON_MINUS()
	{
		return 'minus';
	}

	static get ICON_CALENDAR()
	{
		return 'calendar';
	}

}
