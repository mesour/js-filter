import FilterWidget from './FilterWidget.jsx';
import 'mesour-core/dist/mesour.min.js';
import Modal from 'mesour-modal/lib/Modal';
import DateTime from 'mesour-datetime/lib/DateTime';

(function(mesour) {
	mesour.createWidget('datetime', new DateTime());
	mesour.createWidget('modal', new Modal());
	mesour.createWidget('filter', new FilterWidget());
})(window.mesour);

import './../scss/style.scss';
