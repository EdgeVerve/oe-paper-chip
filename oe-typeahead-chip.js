/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

import { html } from "@polymer/polymer/polymer-element.js";
import { OEAjaxMixin } from "oe-mixins/oe-ajax-mixin.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "@polymer/paper-listbox/paper-listbox.js";
import "@polymer/paper-material/paper-material.js";
import "@polymer/iron-dropdown/iron-dropdown.js";
import "@polymer/paper-item/paper-item.js";
import "./oe-paper-chip.js";
var OePaperChip = window.customElements.get("oe-paper-chip");

/**
 * `oe-typeahead-chip`
 *  A control extending from oe-paper-chip , provides suggestions to be picked up.
 * 
  * ## Styling
 * 
 * The following custom properties and mixins are available for styling
 * 
 * CSS Variable | Description | Default
 * ----------------|-------------|----------
 * `--paper-input-container-invalid-color` | Color applied to asterisk indicating, required field | `--paper-deep-orange-a700`
 * `--paper-input-container-color`         | Default container color        | `--secondary-text-color`
 * `--oe-label-mixin`                      | Mixin applied on label         | 
 * 
 * @customElement
 * @polymer
 * @demo demo/oe-typeahead-chip-demo.html
 * @appliesMixin OEAjaxMixin
 */
class OeTypeaheadChip extends OEAjaxMixin(OePaperChip) {

    static get is() { return 'oe-typeahead-chip'; }

    static get template() {
        return html`
        <style include="iron-flex iron-flex-alignment">

        paper-item:hover{
           background-color: #ccc;
        }

        paper-item{
            --paper-item-selected: {
                background-color: #ccc;
            }
        }

        .dropdown-content > ::slotted{
            max-height: 240px;
        }

        </style>
        ${super.template}
        <div>
            <iron-dropdown id="dropdown" no-auto-focus opened="[[_suggestions.length]]">
                <paper-material slot="dropdown-content" class="dropdown-content">
                <paper-listbox id="menu">
                    <template is="dom-repeat" items="{{_suggestions}}" sort="sortData">
                        <paper-item on-tap="_onPaperItemTap" data-item={{item}} data-index=[[index]]>
                            <span>[[getDisplayValue(item)]]</span>
                        </paper-item>
                    </template>
                </paper-listbox>
                </paper-material>
            </iron-dropdown>
        </div>
    `;
    }

    static get properties() {
        return {
            /**
             * Property to be displayed in chips and menu
             */
            displayproperty: {
                type: String
            },

            /**
             * Property to be pushed into the value array
             */
            valueproperty: {
                type: String
            },

            /**
             * Array of string or objects
             */
            value: {
                type: Array,
                notify: true,
                observer: '_fetchModel'
            },

            _suggestions: {
                type: Array,
                observer: '_suggestionsChanged'
            },

            /** 
             * Select unique values only when values are of type String or Number.
             */
            unique: {
                type: Boolean,
                value: false
            },

            selectedItem: {
                type: Object,
                notify: true
            },

            debounceDuration: {
                type: Number,
                value: 300
            },

            /**
             * Url used for searching using the input entered. It should contain a place holder 'SEARCH_STRING' for this search text
             * like : /getData/Location?filter=SEARCH_STRING.
             */
            searchurl: {
                type: String
            },

            /**
             * Url used to fetch the value objects once value is set on this element.
             */
            dataurl: {
                type: String,
                observer: '_fetchModel'
            },

            disabled: {
                type: Boolean,
                notify: true,
                value: false
            },

            required: {
                type: Boolean,
                notify: true,
                value: false
            }

            /**
             * Fired when a item from the menu is selected.
             *
             * @event pt-item-confirmed
             */
        };
    }

    constructor() {
        super();
        this._selectedItems = [];
    }

    connectedCallback() {
        super.connectedCallback();
        //Listener to fetch data on user input
        this.inputElement.firstElementChild.addEventListener('input', this._onSearchInput.bind(this));
        //Listener to navigate the menu dropdown
        this.inputElement.firstElementChild.addEventListener('keyup', this._onKeyUp.bind(this));
        //Listener to validate on blur
        this.inputElement.firstElementChild.addEventListener('blur', this._blurHandler.bind(this));
    }

    static get observers() {
        return ["_valueListChanged(value.*)"];
    }

    /**
     * Sets the _dummyText based on the length of 'value' property.
     * This inturn handles the label float of the input.
     * @param {changeObject} delta 
     */
    _valueListChanged(delta) {
        if (this.value && this.value.length > 0) {
            this.set("_dummyText", this.value.toString());
        } else {
            this.set("_dummyText", "");
        }
    }

    /**
     * Overrides oe-paper-chip event listener to ignore handling usage of seperator keys like 
     * comma (,) and Enter.
     * 
     * @param {keydownEvent} e 
     */
    _keyDown(e) {
        var wouldBeText = e.target.value;
        if (e.keyCode === 8) {
            //Backspace removes
            if (wouldBeText === '') {
                // the string is empty , so remove a chip if present
                if (this.value && this.value.length > 0) {
                    var chipEl = this.shadowRoot.querySelector('oe-chip[data-index="' + (this.value.length - 1) + '"]');
                    if (chipEl) {
                        chipEl.focus();
                        return;
                    }
                }
            }
            wouldBeText = wouldBeText ? wouldBeText.substr(0, wouldBeText.length - 1) : wouldBeText;
            this._dummyText = wouldBeText || this.value;
        } else {
            this.set('_dummyText', e.key);
        }
    }

    /**
     * Handles key up event to focus and navigate the menu dropdown.
     * @param {keyupEvent} e 
     */
    _onKeyUp(e) {
        var keycode = e.keyCode || e.which || e.key;
        var suggestionsMenu = this.$.menu;

        if (keycode == 40) {
            e.preventDefault();
            //down button
            if (suggestionsMenu) {
                var selectedItem = suggestionsMenu.selectedItem;
                var index = 0;
                if (typeof (selectedItem) != 'undefined') {
                    index = Number(suggestionsMenu.indexOf(selectedItem));
                    index = Math.min(index + 1, this._suggestions.length - 1);
                }
                console.log("selection changed to : ", index);
                suggestionsMenu.select(index);
            }
            this.inputElement.inputElement.focus();
        } else if (keycode == 38) {
            //up
            e.preventDefault();
            if (suggestionsMenu) {
                var selectedItem = suggestionsMenu.selectedItem; // eslint-disable-line no-redeclare
                if (typeof (selectedItem) != 'undefined') {
                    index = Number(suggestionsMenu.indexOf(selectedItem));
                    index = Math.max(index - 1, -1);
                    suggestionsMenu.select(index);
                }
            }
            this.inputElement.inputElement.focus();
        } else if (keycode == 13) {
            //enter
            if (this._suggestions.length === 0) {
                //When enter key is pressed without any suggestions
                return;
            }
            if (suggestionsMenu && typeof (suggestionsMenu) != 'undefined') {
                var selectedItem = suggestionsMenu.selectedItem || suggestionsMenu.focusedItem; // eslint-disable-line no-redeclare
                if (typeof (selectedItem) != 'undefined') {
                    this.setSelectedItem(selectedItem.dataItem);
                }
            }
        }
    }

    /**
     * On user input makes ajax call to get suggestions.
     * @param {inputEvent} e 
     */
    _onSearchInput(e) {
        var wouldBeText = e.target.value.trim();
        if (!this._suggestions) {
            this.set('_suggestions', []);
        }
        if (wouldBeText == '') {
            this.set('_suggestions', []);
            this.setSelectedItem(undefined);
            return;
        } else {
            if (!this.searchurl) {
                this.set('_suggestions', []);
                this.setSelectedItem(undefined);
                return;
            }
            var searchUrl = this._getRequestUrl(wouldBeText);
            this.debounce('search', function () {
                this.makeAjaxCall(searchUrl, 'GET', null, null, null, null, function (err, resp) {
                    if (err) {
                        this.resolveError(err);
                        this.set('_suggestions', []);
                        return;
                    } else {
                        if (Array.isArray(resp)) {
                            if (this.unique && Array.isArray(this.value)) {
                                var value = this.value;
                                var valueproperty = this.valueproperty;
                                var filtered = resp.filter(function (item) {
                                    var suggestionVal = valueproperty ? item[valueproperty] : item;
                                    return suggestionVal && (value.indexOf(suggestionVal) === -1);
                                });
                                this.set('_suggestions', filtered);
                            } else {
                                this.set('_suggestions', resp);
                            }
                        } else {
                            this.set('_suggestions', []);
                        }
                    }
                }.bind(this));
            }.bind(this), this.debounceDuration);
        }
    }

    /**
     * Generate a search url based on replacing 'searchurl' property with search_string key.
     * @param {string} searchString 
     */
    _getRequestUrl(searchString) {
        var re = new RegExp('SEARCH_STRING', 'g');
        var ret = undefined;
        if (this.searchurl) {
            ret = this.searchurl.replace(re, encodeURI(searchString));
        }
        return ret;
    }

    /**
     * Gets the value to be displayed in dropdown menu
     * @param {Object} item 
     */
    getDisplayValue(item) {
        if (item && this.displayproperty) {
            item = this._deepValue(item, this.displayproperty);
        }
        return item ? item.toString() : '';
    }

    /**
     * Selects the tapped menu item.
     * @param {tapEvent} e 
     */
    _onPaperItemTap(e) {
        this.setSelectedItem(e.currentTarget.dataItem);
        e.stopPropagation();
    }

    /**
     * Handles selection of item and pushes it to the 'value' array.
     * Maintains a copy in _selectedItems.
     * @param {Object} item 
     */
    setSelectedItem(item) {
        if (item == undefined) return;
        this.value = this.value || [];
        this._selectedItems = this._selectedItems || [];
        if (this.valueproperty) {
            this.push('value', item ? item[this.valueproperty] : undefined);
        } else {
            this.push('value', item);
        }
        this.push('_selectedItems', item);
        this.fire('pt-item-confirmed', item);
        this.$.tagInput.value = "";
        this.set('_suggestions', []);
        this.$.tagInput.focus();
        this._validate();
    }

    /**
     * Overiding oe-paper-chip remove code to handle selectedItems list
     * 
     */
    _onremove(e) {
        this.splice('value', e.model.index, 1);
        this.splice('_selectedItems', e.model.index, 1);
        if (this.value.length == 0) {
            this.value = undefined;
            this._dummyText = this.$.tagInput.value;
        }
        this._validate();
    }

    _blurHandler() {
        if (this.displayValue && this._suggestions) {
            var matchingRecord = this._suggestions.find(function (s) {
                return this.getDisplayValue(s) === this.displayValue;
            }.bind(this));
            if (matchingRecord) {
                this.setSelectedItem(matchingRecord);
            }
        }
        this.async(function () {
            this.validate();
        }.bind(this), 0);
    }

    /**
 * Performs validation of the entered value.
 * @return {boolean} valid flag
 */
    _validate() {

        var isValid = true;
        if (this._dummyText) {
            this.setValidity(false, 'no-matching-records');
            isValid = false;
        } else if (this.required && !this.value) {
            this.setValidity(false, 'valueMissing');
            isValid = false;
        } else if (this.required && this.value) {
            this.setValidity(true);
        }
        return isValid;
    }

    /**
     * Overriding chip label to be fetched based on displayproperty
     * @param {any} value 
     */
    _getChipLabel(value) {
        if (this.displayproperty && this._selectedItems.length > 0) {
            var itemForValue;
            if (this.valueproperty) {
                itemForValue = this._selectedItems.find(function (s) {
                    return this._deepValue(s, this.valueproperty) === value;
                }.bind(this));
            } else {
                itemForValue = this._selectedItems.find(function (s) {
                    return s === value;
                }.bind(this));
            }
            return this._deepValue(itemForValue, this.displayproperty);
        } else {
            return value;
        }
    }

    /**
     * On suggestion change resizes the dropdown with and selects the first item in the menu.
     */
    _suggestionsChanged() { // eslint-disable-line no-unused-vars
        if (this._suggestions && this._suggestions.length > 0) {
            this.$.menu.set('selected', 0); // always select the first item as focused|selected
            this.$.dropdown.style.width = this.offsetWidth + 'px';
        }
    }

    /*
     * Sorts data based on displayproperty
     * Kept method as public so that user can overwrite it if needed
     */
    sortData(a, b) {
        return this.getDisplayValue(a) > this.getDisplayValue(b) ? 1 : -1;
    }

    /**
     * When new value is set on the element , makes call to dataurl with the 'value' stringified,
     * To get the list of selected Items.
     */
    _fetchModel() {

        if (!this.value || this.value.length === 0) {
            //console.log('newvalue is null');
            this.setSelectedItem(undefined);
            return;
        }

        if (this.selectedItem && (this.selectedItem === this.value || this.value == this.selectedItem[
            this.valueproperty])) {
            //console.log('input object is same as newvalue');
            // new value is same as what is already set
            return;
        }

        if (this.value && this.value.length > 0) {
            var domRenderer = this.$["chip-renderer"];
            if (typeof this.value[0] === "object") {
                this.value.forEach(function (v) {
                    this.push('_selectedItems', v);
                }.bind(this));
                domRenderer.set('items', []);
                this.async(function () {
                    domRenderer.set('items', this.value);
                }, 0);
            } else if (typeof this.value[0] === "string" && this.dataurl) {
                var re = new RegExp('VALUE_STRING', 'g');
                var fetchUrl = this.dataurl.replace(re, JSON.stringify(this.value));
                this.makeAjaxCall(fetchUrl, 'GET', null, null, null, null, function (err, resp) {
                    if (err) {
                        this.resolveError(err);
                        this.setSelectedItem(undefined);
                    }
                    if (Array.isArray(resp)) {
                        resp.forEach(function (item) {
                            this.push('_selectedItems', item);
                        }.bind(this));
                        domRenderer.set('items', []);
                        this.async(function () {

                            domRenderer.set('items', this.value);
                        }, 0);
                    }
                }.bind(this));
            }
        }
    }
}

window.customElements.define(OeTypeaheadChip.is, OeTypeaheadChip);