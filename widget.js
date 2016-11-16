define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/_base/lang",
    "dojo/query",
    "dojo/_base/array",
    "dojo/NodeList-traverse"
], function(declare, _WidgetBase, lang, query, array) {
    "use strict";

    return declare("AbstractPhoneGapWidget.widget.AbstractPhoneGapWidget", _WidgetBase, {

        // Set in modeler
        elementClass: "",
        elementName: "",

        // Should be overwritten when using this
        phoneGapPluginName: "pluginname",
        pluginNotFoundError: "Unable to detect Phonegap/Plugin functionality.",

        // internal variables.
        _setup: false,
        _obj: null,

        update: function(obj, callback) {
            this._obj = obj;

            if (this.elementClass === "" && this.elementName === "") {
                logger.warn(this.id + ".update: No element/class is set in the modeler");
                return;
            }

            if (!this._setup) {
                this._setupWidget(callback);
            } else {
                mendix.lang.nullExec(callback);
            }
        },

        _setupWidget: function(callback) {
            logger.debug(this.id + "._setupWidget");
            this._setup = true;

            this._setElementEventHandler();

            mendix.lang.nullExec(callback);
        },

        _setElementEventHandler: function () {
            logger.debug(this.id + "._setElementEventHandler");
            var className = this.elementClass || ".mx-name-" + this.elementName,
                parentNode = query(this.domNode).parent(),
                targetElements = parentNode.children(className).first();

            if (targetElements.length === 0) {
                logger.warn(this.id + "._setElementEventHandler: Can't find element with class " + className + ", quiting");
                return;
            }

            array.forEach(targetElements, lang.hitch(this, function (el, i) {
                this._setupEvents(el, className);
            }));
        },

        _setupEvents: function(element, className) {
            logger.debug(this.id + "._setupEvents " + className);
            // Attach only one event to dropdown list.
            this.connect(element, "click", lang.hitch(this, function(evt) {
                if (!window.plugins || !window.plugins[this.phoneGapPluginName]) {
                    mx.ui.error(this.pluginNotFoundError);
                    return;
                }
                this._onClickAction();
            }));
        },

        // Stub, should be overwritten
        _onClickAction: function () {}
    });
});
