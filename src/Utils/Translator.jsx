export default class Translator
{

	static translate(key)
	{
		return Translator.DICTIONARY[key] ? Translator.DICTIONARY[key] : key;
	}

	static translateMonth(num)
	{
		return Translator.DICTIONARY['months'][num];
	}

	static get DICTIONARY()
	{
		return {
			'months': {
				1: 'January',
				2: 'February',
				3: 'March',
				4: 'April',
				5: 'May',
				6: 'June',
				7: 'July',
				8: 'August',
				9: 'September',
				10: 'October',
				11: 'November',
				12: 'December'
			},
			'closeAll': 'close all',
			'empty': 'empty',
			'true': 'true',
			'false': 'false'
		};
	}

}
