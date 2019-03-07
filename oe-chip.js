/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";

/**
 * oe-chip
 * Chip component to be used in oe-paper-chip and oe-typeahead-chip components
 */
class OeChip extends OECommonMixin(PolymerElement) {
    static get is() {
        return 'oe-chip';
    }

    static get template() {
        return html`
        <style include="iron-flex iron-flex-alignment">
            :host{
                box-sizing: border-box;
                height: 32px;
                border-radius: 16px;
                margin-right:1px;
                margin-bottom:1px;
                vertical-align: top;
                position: relative;
                outline: none;
                font-size: 14px;
                cursor: default;
                overflow: visible;
                background-color: #eeeeee;
                @apply(--layout-horizontal);
                @apply(--layout-center);
            }
            
            :host(:focus){
                box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
            }

            .label{
                display: block;
                white-space: nowrap;
                margin: 0;
                font-weight: normal;
                font-size: 14px;
                padding: 0 4px 0 12px;
                color: #737373;
            }
        
            iron-icon{
                position: relative;
                margin: 0 8px 0 4px;
                padding: 2px;
                width: 12px;
                height: 12px;
                border-radius: 100%;
                background-color: #bdbdbd;
                color: #ffffff;
                cursor: pointer;
            }
        </style>
        <span class="label">[[label]]</span>
        <iron-icon icon="close" class="remove-btn" on-click="_onremove"></iron-icon>
        `;
    }

    static get properties() {
        return {
            /**
             * Label to display inside the chip
             */
            label: {
                type: String
            }
        };
    }
    /**
     * Fires remove-chip event when close btn is clicked
     *
     */
    _onremove(e) {
        this.fire('remove-chip');
    }
}
window.customElements.define(OeChip.is, OeChip);