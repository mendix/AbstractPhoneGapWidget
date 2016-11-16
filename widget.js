define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/_base/lang",
    "dojo/query",
    "dojo/dom-class",
    "dojo/_base/array",
    "dojo/NodeList-traverse"
], function(declare, _WidgetBase, lang, query, dojoClass, array) {
    "use strict";

    return declare("AbstractPhoneGapWidget.widget.AbstractPhoneGapWidget", _WidgetBase, {

        // Set in modeler
        elementClass: "",
        elementName: "",
        hideOnNotPhoneGap: false,

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

        // Overwrite this one in the specific widget if necessary.
        _phoneGapCheck: function () {
            return !(!window.plugins || !window.plugins[this.phoneGapPluginName]);
        },

        _setupWidget: function(callback) {
            logger.debug(this.id + "._setupWidget");
            this._setup = true;

            this._setElementEventHandler();

            mendix.lang.nullExec(callback);
        },

        _getClassName: function () {
            var className = null;
            if (this.elementClass !== "") {
                className = this.elementClass.trim();
                if (className.indexOf(".") !== 0) { // because we work with class names, we'll add a dot at the beginning if missing
                    className = "." + className;
                }
            } else if (this.elementName !== "") {
                className = ".mx-name-" + this.elementName.trim();
            }
            return className;
        },

        _setElementEventHandler: function () {
            logger.debug(this.id + "._setElementEventHandler");
            var className = this._getClassName(),
                parentNode = query(this.domNode).parent(),
                targetElements = parentNode.children(className).first();

            if (targetElements.length === 0) {
                logger.warn(this.id + "._setElementEventHandler: Can't find element with class " + className + ", quiting");
                return;
            }

            array.forEach(targetElements, lang.hitch(this, function (el, i) {
                this._setupElement(el, className);
            }));
        },

        _setupElement: function(element, className) {
            logger.debug(this.id + "._setupElement " + className);
            this.connect(element, "click", lang.hitch(this, function(evt) {
                if (!this._phoneGapCheck()) {
                    mx.ui.error(this.pluginNotFoundError);
                    return;
                }
                this._onClickAction();
            }));

            if (this.hideOnNotPhoneGap) {
                this._setVisibility(element);
            }
        },

        _setVisibility: function (element) {
            dojoClass.toggle(element, "hidden", !this._phoneGapCheck());
        },

        // Stub, should be overwritten
        _onClickAction: function () {}
    });
});
