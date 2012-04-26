/* --------------------------------------------------------

    jq-quickvalidate 1.1

    * Author: Cedric Ruiz
    * License: GPLv2
    * Website: https://github.com/elclanrs/jq-quickvalidate

-------------------------------------------------------- */

(function ($) {

    'use strict';
    
    // Polyfill Object.keys()
    var getKeys = function (obj) {
        var keys = [], key;
        for (key in obj) {
            keys.push(key);
        }
        return keys;
    };

    $.fn.quickValidate = function (ops) {

        // Default options
        var o = $.extend({
            inputs: {},
            onSuccess: function () {
                alert('Thank you...');
            },
            onFail: function () {
                // What happens on submit if the form
                // does NOT validate.
                alert('The form does not validate! Check again...');
            },
            filters: {
                // Add your own filters
                // ie. myfilter: { regex: /something/, error: 'My error' }
            }
        }, ops);

        // Cache variables
        var $form = this,
            // Only process these elements
            $inputs = $('[name="'+ getKeys(o.inputs).join('"], [name="') +'"]');
            
/* --------------------------------------------------------

    getUserObj

-------------------------------------------------------- */
            
        var getUserObj = function($input){
            return o.inputs[$input.attr('name')];
        };
            
/* --------------------------------------------------------

    Default filters:

    * ie. <input type="text" class="required username"></input>
    * input will match filter name `username`

-------------------------------------------------------- */

        var filters = {
            number: {
                regex: /\d+/,
                error: 'Must be a number.'
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
                error: 'Must be a valid e-mail address. (e.g. user@gmail.com)'
            },
            phone: {
                regex: /^[2-9]\d{2}-\d{3}-\d{4}$/,
                error: 'Must be a valid US phone number. (e.g. 555-123-4567)'
            },
            zip: {
                regex: /^\d{5}$|^\d{5}-\d{4}$/,
                error: 'Must be a valid US zip code. (e.g. 33245 or 33245-0003)'
            },
            url: {
                regex: /^(?:(ftp|http|https):\/\/)?(?:[\w\-]+\.)+[a-z]{3,6}$/i,
                error: 'Must be a valid URL. (e.g. www.google.com)'
            },
            date: {
                regex: function (userInput, value) {
                    var match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value),
                        isDate = function (m, d, y) {
                            return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate();
                        };
                    return match && isDate(match[1], match[2], match[3]);
                },
                error: 'Must be a valid date. (e.g. mm/dd/yyyy)'
            },
            istaken: {
                regex: function (userInput, value) {
                    this.error = '"'+ value + '" is not available.';
                    return !~$.inArray(value, userInput.data);
                }
            }
        };

        // Merge custom and default filters
        $.extend(true, filters, o.filters);

/* --------------------------------------------------------

    Validate(data, value):

    * userInput: @obj containing user defined input properties
    * value: the value of the given input

-------------------------------------------------------- */

        var validate = function (userInput, value) {
            var isValid = true,
                error = '',
                userFilters = userInput.filters;
            if (!value && /required/.test(userFilters)) {
                error = 'This field is required.';
                isValid = false;
            }
            if (value) {
                userFilters = userFilters.split(/\s/);
                $.each(userFilters, function (i, d) {
                    if (filters[d]) {
                        if (
                            typeof filters[d].regex === 'function' && !filters[d].regex(userInput, value) || 
                            filters[d].regex instanceof RegExp && !filters[d].regex.test(value)
                        ) {
                            isValid = false;
                            error = userInput.error || filters[d].error;
                            return false;
                        }
                    }
                });
            }
            return {
                isValid: isValid,
                error: error
            };
        };

/* --------------------------------------------------------

    Analyze($input):

    * $input: an input jQuery object.

-------------------------------------------------------- */

        var analyze = function ($input) {
            var userInput = getUserObj($input),
                value = $input.val(),
                test = validate(userInput, value),
                $error = $input.siblings('.error'),
                $icon = $input.siblings('.valid-icon');
            $input.removeClass('invalid');
            $form.find('.error').add($icon).hide();
            if (!test.isValid) {
                $input.addClass('invalid');
                $error.css({
                    right: - ($error.outerWidth()),
                    top: $input.outerHeight() / 2
                }).text(test.error).show();
            }
            if (value && test.isValid) {
                $error.hide();
                $icon.show();
            }
        };

/* --------------------------------------------------------

    Events:

-------------------------------------------------------- */

        // Placeholder support
        (function (i) {
            if (!('placeholder' in $('<input>')[0])) {
                i.each(function () {
                    $(this).val($(this).attr('placeholder'));
                }).on({
                    focus: function () {
                        this.value === $(this).attr('placeholder') && $(this).val('');
                    },
                    blur: function () {
                        $(this).val() || $(this).val($(this).attr('placeholder'));
                    }
                });
            }
        }($inputs));

        $inputs.each(function () {
            var $this = $(this);
            $('<span class="error"></span><i class="valid-icon"></i>').hide().insertAfter($this);
            if (/required/.test(getUserObj($this).filters)) {
                analyze($this);
            }
        }).on({
            keyup: function () {
                analyze($(this));
            },
            focus: function(){
                analyze($(this));
            },
            blur: function(){
                analyze($(this));
            }
        }).eq(0).focus(); // Focus first field
        
        $form.submit(function (e) {
            if ($form.find('input.invalid').length) {
                e.preventDefault();
                o.onFail();
            } else {
                o.onSuccess();
            }
        });
        return this;
    };
}(jQuery));