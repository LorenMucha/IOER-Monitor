const feedback={
    endpoint_id:"feedback_div",
    text:{
        de:{
            like:'Haben Sie Anregungen oder Wünsche ?</b><br/>Lassen Sie es uns wissen',
            message:"Nachricht",
            send:"Senden",
            cancel:"Abbrechen"
        },
        en:{
            like:'Do you have suggestions or wishes ? </b><br/> Let us know',
            message:"Message",
            send:"Send",
            cancel:"Cancel"
        }
    },
    open:function(){
        let lan = language_manager.getLanguage(),
            html = he.encode(`
                            <div class ="jq_dialog" id="${this.endpoint_id}">
                                <span><b>${this.text[lan].like}</span>
                                <form class="form" id="reg_form">
                                    <fieldset>
                                        <div class="form-group feedback_form">
                                            <label class="col-md-4 control-label feeback_label first" >Name</label>
                                            <div class="col-md-6  inputGroupContainer">
                                                <div class="input-group"> <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                                                    <input id="name" name="name" placeholder="Name" class="form-control input_feedback"  type="text"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group feedback_form">
                                            <label class="col-md-4 control-label feeback_label">E-Mail</label>
                                            <div class="col-md-6  inputGroupContainer">
                                                <div class="input-group"> <span class="input-group-addon"><i class="glyphicon glyphicon-envelope"></i></span>
                                                    <input id="email" name="email" placeholder="E-Mail Addresse" class="form-control input_feedback"  type="text"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group feedback_form">
                                            <label class="col-md-4 control-label feeback_label">${this.text[lan].message}</label>
                                            <div class="col-md-6  inputGroupContainer">
                                                <div class="input-group"> <span class="input-group-addon"><i class="glyphicon glyphicon-pencil"></i></span>
                                                    <textarea class="form-control input_feedback" rows="10" id="message" name="message" placeholder="${this.text[lan].message}.. "></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                </form>
                                 <div class="form-group btn-group-feedback">
                                        <div class="btn-group">
                                            <button class="btn btn-primary send" style="margin-right: 30px;" onclick="feedback.controller.send();">${this.text[lan].send} 
                                                <span class="glyphicon glyphicon-send"></span>
                                            </button>
                                            <button class="btn btn-primary cancel" onclick="dialog_manager.content.remove()">${this.text[lan].cancel} 
                                                <span class="glyphicon glyphicon-remove"></span>
                                            </button>
                                        </div>
                                </div>
                            </div>
            `);
        //settings for the manager
        let instructions = {
            endpoint:`${this.endpoint_id}`,
            html:html,
            title:"Feedback",
            modal:true
        };
        dialog_manager.setInstruction(instructions);
        dialog_manager.create();
        this.controller.validate();
    },
    controller:{
        /*validator*/
        validate:function() {

            let lan = language_manager.getLanguage(),
                messages = {
                    de: {
                        name: "Bitte nennen Sie uns ihren Namen",
                        name_notEmpty: "Dies ist kein gültiger Name",
                        message: "Bitte hinterlassen Sie uns eine Nachricht, mit mindestens 10 und maximal 1000 Zeichen",
                        message_notEmpty: "Bitte hinterlassen Sie uns eine Nachricht, mit mindestens 10 Zeichen",
                        email: "Bitten nennen Sie uns ihre Email Adresse",
                        email_notEmpty: "Dies ist keine gültige Email Adresse"
                    },
                    en: {
                        name: "Please tell us your name",
                        name_notEmpty: "This is not a valid name",
                        message: "Please leave us a message with at least 10 characters",
                        message_notEmpty: "Please leave us a message with at least 10 and a maximum of 1000 characters",
                        email: "Please give us your email address",
                        email_notEmpty: "This is not a valid email address"
                    }
                };

            //Quelle: http://bootstrapvalidator.votintsev.ru/getting-started/
            $('#reg_form').bootstrapValidator({
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    name: {
                        validators: {
                            stringLength: {
                                min: 2,
                                message: messages[lan].name

                            },
                            notEmpty: {
                                message: messages[lan].name_notEmpty
                            }
                        }
                    },
                    message: {
                        validators: {
                            stringLength: {
                                min: 10,
                                max:1000,
                                message: messages[lan].message
                            },
                            notEmpty: {
                                message: messages[lan].message_notEmpty
                            }
                        }
                    },
                    email: {
                        validators: {
                            notEmpty: {
                                message: messages[lan].email
                            },
                            emailAddress: {
                                message: messages[lan].email_notEmpty
                            }
                        }
                    }
                }
            });
        },
        send:function(){
            let send = 'true',
                selector = $("#reg_form"),
                // Use Ajax to submit form data
                name = selector.find("#name").val(),
                email = selector.find("#email").val(),
                message = selector.find("#message").val(),
                url = 'https://monitor.ioer.de/monitor_api/email/';

            RequestManager.sendMailFeedback(name,email,message);
            //close the dialog
            dialog_manager.content.remove();
        }
    }
};