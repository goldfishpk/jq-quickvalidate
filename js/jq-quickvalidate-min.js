/* --------------------------------------------------------

    jq-quickvalidate 1.2

    * Author: Cedric Ruiz
    * License: GPLv2
    * Website: https://github.com/elclanrs/jq-quickvalidate

-------------------------------------------------------- */(function(a){"use strict";var b=Object.keys||function(a){var b=[],c="";for(c in a)a.hasOwnProperty(c)&&b.push(c);return b};a.fn.quickValidate=function(c){var d=a.extend({inputs:{},onSuccess:function(a){alert("Thank you...")},onFail:function(){alert("The form does not validate! Check again...")},filters:{}},c),e=this,f=a('[name="'+b(d.inputs).join('"], [name="')+'"]'),g={number:{regex:/\d+/,error:"Must be a number."},digits:{regex:/^\d+$/,error:"Must be only digits."},name:{regex:/^[A-Za-z]{3,}$/,error:"Must be at least 3 characters long, and must only contain letters."},username:{regex:/^[a-z](?=[\w.]{3,31}$)\w*\.?\w*$/i,error:"Must be at between 4 and 32 characters long and start with a letter. You may use letters, numbers, underscores, and one dot (.)"},pass:{regex:/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,error:"Must be at least 6 characters long, and contain at least one number, one uppercase and one lowercase letter."},strongpass:{regex:/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,error:"Must be at least 8 characters long and contain at least one uppercase and one lowercase letter and one number or special character."},email:{regex:/^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/,error:"Must be a valid e-mail address. <em>(e.g. user@gmail.com)</em>"},phone:{regex:/^[2-9]\d{2}-\d{3}-\d{4}$/,error:"Must be a valid US phone number. <em>(e.g. 555-123-4567)</em>"},zip:{regex:/^\d{5}$|^\d{5}-\d{4}$/,error:"Must be a valid US zip code. <em>(e.g. 33245 or 33245-0003)</em>"},url:{regex:/^(?:(ftp|http|https):\/\/)?(?:[\w\-]+\.)+[a-z]{3,6}$/i,error:"Must be a valid URL. <em>(e.g. www.google.com)</em>"},min:{regex:function(a,b){return this.error="Must be at least "+a.data.min+" characters long.",b.length>a.data.min-1}},max:{regex:function(a,b){return this.error=a.data.max+" characters max.",b.length<=a.data.max}},date:{regex:function(a,b){var c=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(b),d=function(a,b,c){return a>0&&a<13&&c>0&&c<32768&&b>0&&b<=(new Date(c,a,0)).getDate()};return c&&d(c[1],c[2],c[3])},error:"Must be a valid date. <em>(e.g. mm/dd/yyyy)</em>"},exclude:{regex:function(b,c){return this.error='"'+c+'" is not available.',!~a.inArray(c,b.data.exclude)}}};a.extend(!0,g,d.filters);var h=function(b,c){var d=!0,e="",f=b.filters;return!c&&/required/.test(f)&&(b.errors&&b.errors.required?e=b.errors.required:e="This field is required.",d=!1),c&&(f=f.split(/\s/),a.each(f,function(a,f){if(g[f])if(typeof g[f].regex=="function"&&!g[f].regex(b,c)||g[f].regex instanceof RegExp&&!g[f].regex.test(c))return d=!1,e=b.errors&&b.errors[f]||g[f].error,!1})),{isValid:d,error:e}},i=function(a,b){b=b||"";var c=d.inputs[a.attr("name")],f=a.val()===a.attr("placeholder")?"":a.val(),g=h(c,f),i=a.parent().siblings(".error"),j=a.siblings(".invalid-icon"),k=a.siblings(".valid-icon");j.click(function(){a.trigger("focus")}),a.removeClass("invalid valid"),e.find(".error").add(j).add(k).hide(),g.isValid||(a.addClass("invalid"),j.show(),b!=="blur"&&i.html(g.error).show()),f&&g.isValid&&(a.addClass("valid"),i.add(j).hide(),k.show())},j=function(){e.css("visibility","visible"),f.each(function(){a(this).attr("autocomplete","off"),a('<span class="error"></span><i class="invalid-icon"></i><i class="valid-icon"></i>').hide().insertAfter(a(this)),a(this).siblings().andSelf().not("label, .error").wrapAll('<span class="field" />'),i(a(this))}).on("keyup focus blur",function(b){i(a(this),b.type)}).blur(),"placeholder"in a("<input>")[0]||f.each(function(){a(this).val(a(this).attr("placeholder"))}).on({focus:function(){this.value===a(this).attr("placeholder")&&a(this).val("")},blur:function(){a(this).val()||a(this).val(a(this).attr("placeholder"))}})}();return e.submit(function(a){e.find("input.invalid").length?(a.preventDefault(),d.onFail()):d.onSuccess(a)}),this}})(jQuery);