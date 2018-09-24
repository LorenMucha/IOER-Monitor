(function($, undefined){

$.widget("buzzilla.taskbardialog", $.ui.dialog, {
    options: {
        minimized: false,
        minimizeText: "minimize",
        taskbar: null
    },

    _create: function(){
        $.ui.dialog.prototype._create.apply(this, arguments);

        var self = this,
                options = self.options,

                uiDialogTitlebar = self.uiDialogTitlebar
                        .hover(
                            function() {
                                uiDialogTitlebar.addClass('ui-state-hover');
                            },
                            function() {
                                uiDialogTitlebar.removeClass('ui-state-hover');
                            }
                        ),

                uiDialogTitlebarMinimize = $( "<a href='#'></a>" )
                        .addClass( "ui-dialog-titlebar-minimize  ui-corner-all ui-dialog-titlebar-close ui-button" )
                        .attr( "role", "button" )
                        .hover(
                            function() {
                                uiDialogTitlebarMinimize.addClass('ui-state-hover');
                            },
                            function() {
                                uiDialogTitlebarMinimize.removeClass('ui-state-hover');
                            }
                        )
                        .focus(function() {
                            uiDialogTitlebarMinimize.addClass('ui-state-focus');
                        })
                        .blur(function() {
                            uiDialogTitlebarMinimize.removeClass('ui-state-focus');
                        })
                        .click(function(event) {
                            self.minimize(event);
                            return false;
                        })
                        .appendTo( self.uiDialogTitlebar ),

			    uiDialogTitlebarMinimizeText = ( self.uiDialogTitlebarMinimizeText = $( "<span>" ) )
                        .addClass( "ui-icon ui-icon-minusthick" )
                        .text( options.minimizeText )
	        			.appendTo( uiDialogTitlebarMinimize );

        this.element
                .bind("taskbardialogfocus", function(event) {
                    uiDialogTitlebar.addClass('ui-state-focus');
                    self.tile.addClass("ui-state-focus");
                    var active = self.taskbar.data("active_dialog");
                    if(active != self) {
                        if(active) active._trigger("blur", event);
                        self.taskbar.data("active_dialog", self);
                    }
                })
                .bind("taskbardialogblur", function() {
                    uiDialogTitlebar.removeClass('ui-state-focus');
                    self.tile.removeClass("ui-state-focus");
                });

        if(this.options.taskbar) {
            var taskbar = (self.taskbar = $(this.options.taskbar))
                        .addClass("ui-taskbar"),
                tile = (self.tile = $("<div></div>"))
                        .addClass(
                            'ui-taskbar-tile ' +
                            'ui-widget-header ' +
                            'ui-corner-all ' +
                            'ui-helper-clearfix'
                        )
                        .text(this.options.title)
                        .appendTo(taskbar)
                        .click(function() {
                            if(self.options.minimized) {
                                self.restore();
                            } else {
                                var active = self.taskbar.data("active_dialog");
                                if(active == self) {
                                    self.minimize();
                                }
                            }
                            self.moveToTop();
                        });
        } else {
            self.taskbar = $();
            self.tile = $();
        }
    },

    _init: function(){
        $.ui.dialog.prototype._init.apply(this, arguments);
    },

    __layout: function(el) {
        var layout;
        layout = el.offset();
        layout.height = el.css("height");
        layout.width = el.css("width");
        return layout;
    },

    minimize: function(event) {
        var self = this;
        self.dialogLayout = self.__layout(self.uiDialog);

        if(!self.options.minimized) {
            var placeholder = $("<div></div>")
                    .appendTo("body")
                    .addClass("ui-dialog-placeholder")
                    .css(self.dialogLayout)
                    .animate(self.__layout(self.tile), {
                        duration: "fast",
                        complete: function() {
                            placeholder.remove();
                        }
                    });
        }

        this.uiDialog.hide();
        this.options.minimized = true;
    },

    restore: function(event) {
        var self = this;

        if(self.options.minimized && self.dialogLayout) {
            var placeholder = $("<div></div>")
                    .appendTo("body")
                    .addClass("ui-dialog-placeholder")
                    .css(self.__layout(self.tile))
                    .animate(self.dialogLayout, {
                        duration: "fast",
                        complete: function() {
                            placeholder.remove();
                            self.uiDialog.show();
                            self.options.minimized = false;
                        }
                    });
        } else {
            self.uiDialog.show();
            self.options.minimized = false;
        }
    },

    close: function(event) {
        if(this.tile) {
            this.tile.remove();
        }
        $.ui.dialog.prototype.close.apply(this, arguments);
    },
    
    // react to option changes after initialization
    _setOption: function( key, value ){
        var self = this;

        switch(key){
            case 'minimized':
                if(value) self.minimize(); else self.restore();
                break;
            case 'minimizeText':
                self.uiDialogTitlebarMinimizeText.text("" + value);
                break;
        }

        $.ui.dialog.prototype._setOption.apply(self, arguments);
    }
});

})(jQuery);
