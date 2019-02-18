/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { mixinBehaviors } from "@polymer/polymer/lib/legacy/class.js";
import { PaperInputBehavior } from "@polymer/paper-input/paper-input-behavior.js";
import { IronFormElementBehavior } from "@polymer/iron-form-element-behavior/iron-form-element-behavior.js";
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import { OEFieldMixin } from "oe-mixins/oe-field-mixin.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "@polymer/paper-input/paper-input-container.js";
import "@polymer/paper-input/paper-input-error.js";
import "@polymer/iron-input/iron-input.js";
import "oe-i18n-msg/oe-i18n-msg.js";
import "./oe-chip.js";

/**
 * `oe-paper-chip`
 *  A control for editing an array of strings much like a tags control.
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
 * @appliesMixin OECommonMixin
 * @appliesMixin OEFieldMixin
 * @demo demo/oe-paper-chip-demo.html
 */
class OePaperChip extends mixinBehaviors([IronFormElementBehavior, PaperInputBehavior], OECommonMixin(PolymerElement)) {

  static get is() { return 'oe-paper-chip'; }

  static get template() {
    return html`
    <style is="custom-style" include="iron-flex iron-flex-alignment"></style>
    <style>

      :host {
        display: block;
      }

      .tags-input > oe-chip {
        z-index: 1;
      }

      span.required {
        vertical-align: bottom;
        color: var(--paper-input-container-invalid-color, var(--google-red-500));
        @apply --oe-required-mixin;
      }

      paper-input-container {
        display: inline-block;
        width: 100%;
      }

      input{
        @apply --paper-input-container-shared-input-style;
      }

      input::-webkit-input-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }

      input:-moz-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }

      input::-moz-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }

      input:-ms-input-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }

      label{
        @apply --oe-label-mixin;
      }

    </style>

    <paper-input-container id="tags" disabled$="[[disabled]]" invalid="[[invalid]]">
      <label slot="label" hidden$="[[!label]]" aria-hidden="true">
        <oe-i18n-msg msgid=[[label]]>[[label]]</oe-i18n-msg>
        <template is="dom-if" if={{required}}>
          <span class="required" aria-hidden="true"> *</span>
        </template>
      </label>
      <!-- a hidden iron-input holds the bind-value value for paper-input-container -->
      <!-- bind-value={{_dummyText}} is simply a placeholder to decide whether label is float or inline -->
      <iron-input bind-value="{{_dummyText}}">
        <input is="iron-input" type="hidden">
      </iron-input>
      <div class="tags-input layout horizontal wrap" slot="input">
        <template is="dom-repeat" items={{value}} id="chip-renderer">
          <oe-chip tabindex="-1" aria-label$="[[_getChipLabel(item)]]" label=[[_getChipLabel(item)]] data-index$="[[index]]" on-keydown="_handleNav" on-remove-chip="_onremove"></oe-chip>
        </template>
        <iron-input class="flex layout vertical center-center" id$="[[_inputId]]">
          <input id="tagInput" disabled$="[[disabled]]" type="text" aria-required$="[[required]]"
            aria-labelledby$="[[_ariaLabelledBy]]" aria-describedby$="[[_ariaDescribedBy]]">
        </iron-input>
      </div>
      <paper-input-error invalid={{invalid}} slot="add-on">
          <oe-i18n-msg id="i18n-error" msgid={{errorMessage}} placeholders={{placeholders}}></oe-i18n-msg>
      </paper-input-error>
    </paper-input-container>
    `;
  }

  static get properties() {
    return {

      /**
       * Value array of strings or objects
       */
      value: {
        type: Array,
        notify: true,
        observer: '_valueChanged'
      },

      /**
       * Flag denoting only unique values should be added to value
       */
      unique: {
        type: Boolean,
        value: false,
        notify: true
      },

      /**
       * Seperator used to identify each entry.
       */
      separator: {
        type: String,
        value: ','
      },

      /**
       * key name when the 'value' is a array of objects.
       */
      valueProperty: {
        type: String
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.inputElement.firstElementChild.addEventListener('keydown', this._keyDown.bind(this));
  }

  /**
   * Checks the entered key and performs operation based on user input in the input tag.
   * @param {keyDownEvent} e 
   */
  _keyDown(e) {
    // var keyCode = e.key || e.keyCode || e.which;
    if (e.keyCode === 8) {
      var wouldBeText = e.target.value;
      if (wouldBeText === '') {
        // the string is empty , so remove a chip if present
        if (this.value && this.value.length > 0) {
          var chipEl = this.shadowRoot.querySelector('oe-chip[data-index="' + (this.value.length - 1) + '"]');
          if (chipEl) {
            chipEl.focus();
            this.set('__focusedChip',chipEl);
            return;
          }
        }
      }
      wouldBeText = wouldBeText ? wouldBeText.substr(0, wouldBeText.length - 1) : wouldBeText;
      this._dummyText = wouldBeText || this.value;
    } else if (e.keyCode === 13 || e.keyCode === 9 || ((e.key) === this.separator)) {
      var tagValue = e.target.value ? e.target.value.trim() : '';

      if (tagValue !== '') {
        var temp = {};
        if (this.value) {
          if (!this.unique || this.value.indexOf(tagValue) < 0) {
            if (!this.valueProperty) {
              this.splice('value', this.value.length, 0, tagValue);
            } else {
              temp[this.valueProperty] = tagValue;
              this.splice('value', this.value.length, 0, temp);
            }
          }
        } else {
          if (!this.valueProperty) {
            this.value = [tagValue];
          } else {
            temp[this.valueProperty] = tagValue;
            this.value = [temp];
          }
        }
        this._validate();
      }
      e.target.value = '';
      /* prevent default for separator key */
      !(e.keyCode === 13 || e.keyCode === 9) && e.preventDefault();

    } else {
      this.set('_dummyText', e.key);
    }
  }

  /**
   * Helps navigation of user thorugh keyboard once a chip-item is focused. Navigation is done via 
   * UP/DOWN/LEFT/RIGHT/HOME/END keys. The focused chip can be deleted using BACKSPACE key.
   * @param {keyDownEvent} e 
   */
  _handleNav(e) {
    var itemIndex = e.target.dataset.index;
    this.set('__focusedChip',null);
    if (isNaN(itemIndex)) {
      return;
    }
    itemIndex = parseInt(itemIndex);
    e.preventDefault();
    e.stopPropagation();
    switch (e.keyCode) {
      case 37://Left arrow;
        itemIndex--;
        break;
      case 38://Up arrow;
        itemIndex--;
        break;
      case 39://Right arrow;
        itemIndex++;
        break;
      case 40://Down arrow;
        itemIndex++;
        break;
      case 8://Backspace key
        this.splice('value', itemIndex, 1);
        if (this.value.length == 0) {
          this.value = undefined;
        }
        this._validate();
        return;
      case 9://Tab key
        this.$.tagInput.focus();
        return;
      case 36://Home key
        itemIndex = 0;
        break;
      case 35://End key
        itemIndex = this.value.length - 1;
        break;
      default: break;
    }
    if (itemIndex < 0) {
      itemIndex = this.value.length - 1;
    } else if (itemIndex == this.value.length) {
      itemIndex = 0;
    }
    var newEl = this.shadowRoot.querySelector('oe-chip[data-index="' + itemIndex + '"]');
    newEl.focus();
    this.set('__focusedChip',newEl);
  }

  /**
   * Removes the selected chip item.
   * 
   */
  _onremove(e) {
    this.splice('value', e.model.index, 1);
    if (this.value.length == 0) {
      this.value = undefined;
      this._dummyText = this.$.tagInput.value;
    }
    this._validate();
  }

  /**
   * Observer on value change to handle label float.
   */
  _valueChanged(newVal, oldVal) {
    if (newVal) {
      if (typeof newVal === 'string') {
        this.value = JSON.parse(newVal);
      } else {
        this._dummyText = newVal.toString();
      }
    } else {
      this._dummyText = '';
    }
  }

  /**
   * Performs validation of the entered value.
   * @return {boolean} valid flag
   */
  _validate() {

    var isValid = true;
    var errorKey = undefined;
    var placeholders = undefined;
    if (this.required && (!this.value || this.value.length == 0)) {
      errorKey = 'valueMissing';
      isValid = false;
    } else if (this.max && this.value && this.value.length > this.max) {
      errorKey = 'rangeOverflow';
      isValid = false;
      placeholders = [this.max];
    } else if (this.min && (!this.value || this.value.length < this.min)) {
      errorKey = 'rangeUnderflow';
      isValid = false;
      placeholders = [this.min];
    }
    this.setValidity(isValid, errorKey, placeholders);
    return isValid;
  }

  /**
   * Returns the value from the object based on the key
   * @param {any} value Value instance within the array.
   * @return {any} value present in the path of `valueProperty` or the input value.
   */
  _getChipLabel(value) {
    if (this.valueProperty) {
      return  this._deepValue(value,this.valueProperty);
    } else {
      return value;
    }
  }

  /**
   * Returns a reference to the focusable element. Overridden from
   * PaperInputBehavior to correctly focus the native input.
   *
   * @return {HTMLElement}
   */
  get _focusableElement() {
    return PolymerElement ? this.inputElement._inputElement :
      this.inputElement;
  }

  get _inputElement() {
    return PolymerElement ? this.inputElement._inputElement :
      this.inputElement;
  }
}
window.customElements.define(OePaperChip.is, OEFieldMixin(OePaperChip));