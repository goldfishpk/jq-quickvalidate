/* --------------------------------------------------------

    jq-quickvalidate 1.2

    * Author: Cedric Ruiz
    * License: GPLv2
    * Website: https://github.com/elclanrs/jq-quickvalidate

-------------------------------------------------------- */

(function ($) {

    'use strict';
    
/* --------------------------------------------------------

    Utils:
                
-------------------------------------------------------- */  
    
    var utils = {
        getKeys : function (obj) {
            var keys = [],
                key = '';
            for (key in obj) {
                obj.hasOwnProperty(key) && keys.push(key);
            }
            return keys;
        },
        getMaxWidth : function ($elms) {
            var maxWidth = 0;
            $elms.each(function () {
                if ($(this).outerWidth() > maxWidth) {
                    maxWidth = $(this).outerWidth();
                }
            });
            return maxWidth;
        },
        getLessVar: function (name, prop) {
            var value = $('<p class="'+ name +'"></p>').hide().appendTo('body').css(prop);
            $('.' + name).remove();
            return /\d+/.test(value) ? parseInt(value, 10) : value;
        }
    };
    
/* --------------------------------------------------------

    Filters:
                
-------------------------------------------------------- */  
    
    var filters = {
        number: {
            regex: /\d+/,
            error: 'Must be a number.'
        },
        digits: {
            regex: /^\d+$/,
            error: 'Must be only digits.'
        },
        name: {
            regex: /^[A-Za-z]{3,}$/,
            error: 'Must be at least 3 characters long, and must only contain letters.'
        },
        username: {
            regex: /^[a-z](?=[\w.]{3,31}$)\w*\.?\w*$/i,
            error: 'Must be at between 4 and 32 characters long and start with a letter. You may use letters, numbers, underscores, and one dot (.)'
        },
        pass: {
            regex: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
            error: 'Must be at least 6 characters long, and contain at least one number, one uppercase and one lowercase letter.'
        },
        strongpass: {
            regex: /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
            error: 'Must be at least 8 characters long and contain at least one uppercase and one lowercase letter and one number or special character.'
        },
        email: {
            regex: /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/,
            error: 'Must be a valid e-mail address. <em>(e.g. user@gmail.com)</em>'
        },
        phone: {
            regex: /^[2-9]\d{2}-\d{3}-\d{4}$/,
            error: 'Must be a valid US phone number. <em>(e.g. 555-123-4567)</em>'
        },
        zip: {
            regex: /^\d{5}$|^\d{5}-\d{4}$/,
            error: 'Must be a valid US zip code. <em>(e.g. 33245 or 33245-0003)</em>'
        },
        url: {
            regex: /^(?:(ftp|http|https):\/\/)?(?:[\w\-]+\.)+[a-z]{3,6}$/i,
            error: 'Must be a valid URL. <em>(e.g. www.google.com)</em>'
        },
        min: {
            regex: function (ui, value) {
                this.error = 'Must be at least ' + ui.data.min + ' characters long.';
                return value.length > ui.data.min - 1;
            }
        },
        max: {
            regex: function (ui, value) {
                this.error = ui.data.max + ' characters max.';
                return value.length <= ui.data.max;
            }
        },
        date: {
            regex: function (ui, value) {
                var match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value),
                    isDate = function (m, d, y) {
                        return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate();
                    };
                return match && isDate(match[1], match[2], match[3]);
            },
            error: 'Must be a valid date. <em>(e.g. mm/dd/yyyy)</em>'
        },
        exclude: {
            regex: function (ui, value) {
                this.error = '"' + value + '" is not available.';
                return !~$.inArray(value, ui.data.exclude);
            }
        }
    };
    
/* --------------------------------------------------------

    Plugin:
                
-------------------------------------------------------- */  
    
    $.fn.quickValidate = function (ops) {
    
        // Default options
        var o = $.extend({
            inputs : {},
            onSuccess : function (e) {
                alert('Thank you...');
            },
            onFail : function () {
                // What happens on submit if the form
                // does NOT validate.
                alert('The form does not validate! Check again...');
            },
            filters : {
                // Add your own filters
                // ie. myfilter: { regex: /something/, error: 'My error' }
            }
        }, ops);
        
/* --------------------------------------------------------

    Form elements:
                
-------------------------------------------------------- */  

        var $form = this,
            $inputs = $('[name="' + utils.getKeys(o.inputs).join('"], [name="') + '"]'),
            $labels = $form.find('label');
            
/* --------------------------------------------------------

    Actions:
                
-------------------------------------------------------- */  
        
        var actions = {
        
/* --------------------------------------------------------

    Init:
                
-------------------------------------------------------- */   

            init: (function(){
                $form.css('visibility', 'visible').addClass('qval-form');
                $labels.width(utils.getMaxWidth($labels));
                $inputs.attr('autocomplete', 'off');
                $inputs.each(function(){
                    var $input = $(this),
                        $error = $('<span class="error" />'),
                        $valid = $('<i class="valid-icon" />'),
                        $invalid = $('<i/>', {
                            'class' : 'invalid-icon',
                            click : function () {
                                $input.trigger('focus');
                            }
                        });
                    $input.is('textarea') && $error.addClass('textarea'); // Fix textarea
                    $error.add($valid).add($invalid).hide().insertAfter($input);
                    $input.siblings().andSelf().not('label, .error').wrapAll('<span class="field" />');
                });
                // Placeholder support
                if (!('placeholder' in $('<input>')[0])) {
                    $inputs
                        .each(function () {
                            $(this).val($(this).attr('placeholder'));
                        })
                        .on({
                            focus: function () {
                                this.value === $(this).attr('placeholder') && $(this).val('');
                            },
                            blur: function () {
                                $(this).val() || $(this).val($(this).attr('placeholder'));
                            }
                        });
                }
            }()),
            
/* --------------------------------------------------------

    Validate:
    
    * userInput: object containing all user defined filters, errors, data...
    * value: the value of the input being processed            
                
-------------------------------------------------------- */             
        
            validate: function (userInput, value) {
                var isValid = true,
                    error = '',
                    userFilters = userInput.filters;
                if (!value && /required/.test(userFilters)) {
                    if (userInput.errors && userInput.errors.required) {
                        error = userInput.errors.required;
                    } else {
                        error = 'This field is required.';
                    }
                    isValid = false;
                }
                if (value) {
                    userFilters = userFilters.split(/\s/);
                    $.each(userFilters, function (i, uf) {
                        if (filters[uf]) {
                            if (
                                typeof filters[uf].regex === 'function' && !filters[uf].regex(userInput, value) || 
                                filters[uf].regex instanceof RegExp && !filters[uf].regex.test(value)
                            ) {
                                isValid = false;
                                error = (userInput.errors && userInput.errors[uf]) || filters[uf].error;
                                return false;
                            }
                        }
                    });
                }
                return {
                    isValid: isValid,
                    error: error
                };
            },
            
/* --------------------------------------------------------

    Analyze:
    
    * $input: a jQuery input object
    * evt: the event on which `analyze()` is invoked
                
-------------------------------------------------------- */  
            
            analyze: function ($input, evt) {
                evt = evt || '';
                var userInput = o.inputs[$input.attr('name')],
                    value = $input.val() === $input.attr('placeholder') ? '' : $input.val(),
                    test = actions.validate(userInput, value),
                    $error = $input.parent().siblings('.error'),
                    $invalid = $input.siblings('.invalid-icon'),
                    $valid = $input.siblings('.valid-icon');
                    
                // Reset
                $input.removeClass('invalid valid');
                $error.add($invalid).add($valid).hide();
                
                // Invalid
                if (!test.isValid) {
                    $input.addClass('invalid');
                    $invalid.show();
                    evt !== 'blur' && $error.html(test.error).show(); // Keep hidden on blur
                }
                // Valid
                if (value && test.isValid) {
                    $input.addClass('valid');
                    $error.add($invalid).hide();
                    $valid.show();
                }            
            },
            
/* --------------------------------------------------------

    Responsive:
                
-------------------------------------------------------- */  
            
            responsive: function () {
                var maxWidth = utils.getLessVar('qval-field-width', 'width') + $labels.outerWidth(),
                    $emptyLabel = $labels.filter(function () {
                        return $(this).html() === '&nbsp;';
                     });
                $form.width() < maxWidth ? $form.addClass('stack') : $form.removeClass('stack');
                $form.is('.stack') ? $emptyLabel.hide() : $emptyLabel.show();
            }
        };
        
/* --------------------------------------------------------

    Events:
                
-------------------------------------------------------- */   
     
        $inputs
            .on('keyup focus blur', function (e) {
                actions.analyze($(this), e.type);
            })
            .blur(); // Start fresh
        
        $(window).resize(function(){
            actions.responsive();
        });
        
        actions.responsive();
        
        return this;
        
    };
}(jQuery));