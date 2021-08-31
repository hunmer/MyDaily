
var a_get = getGETArray();
//var g_s_api = 'php/';
var g_s_api = 'https://figurosity.glitch.me/';
var g_localKey = 'MyDaily_';
// 本地储存前缀
var g_config = local_readJson('config', {
});

var g_v_coll = local_readJson('collections', {
});

var g_v_daily = local_readJson('daily', {
});

var g_v_questions = local_readJson('questions', getDefaultValue('questions'));
var g_v_questions_types = local_readJson('questions_types', getDefaultValue('questions_types'));

function getDefaultValue(type){
    switch(type){
        case 'questions':
 return {
        q1: {
            tip: '123',
            prop: [],
            html: '<input type="text" placeholder="...">'
        },
q2: {
            tip: '123',
            prop: [],
            html: `
            <div class="form-check">
          <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios1" value="option1">
          <label class="form-check-label" for="gridRadios1">
            First radio
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios2" value="option2">
          <label class="form-check-label" for="gridRadios2">
            Second radio
          </label>
        </div>
        <div class="form-check disabled">
          <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios3" value="option3" disabled>
          <label class="form-check-label" for="gridRadios3">
            Third disabled radio
          </label>
        </div>
        `

        },
q3: {
            tip: '123',
            prop: [],
            html: `<select class="custom-select">
  <option selected>Open this select menu</option>
  <option value="1">One</option>
  <option value="2">Two</option>
  <option value="3">Three</option>
</select>`
        }       
    };            
    break;

    case 'questions_types':
        return {
            Input: {
                html: `<input class="w-100" type="text" placeholder="...">`,
                script: ``
            },
 CheckBox: {
                html: `
<div class="form-check">
          <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios1" value="option1">
          <label class="form-check-label" for="gridRadios1">
            First radio
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios2" value="option2">
          <label class="form-check-label" for="gridRadios2">
            Second radio
          </label>
        </div>
                `,
                script: ``
            },            
 Select: {
                html: `
                <select class="custom-select">
  <option selected>Open this select menu</option>
  <option value="1">One</option>
  <option value="2">Two</option>
</select>>`,
                script: ``
            },            


        }
        break;
    }
   
}

function _s1(s, j = ''){
    s = parseInt(s);
    return (s == 0 ? '' : (s<10 ? '0'+s : s) + j) ;
}

function _s2(s, j = ''){
    s = parseInt(s);
    return (s == 0 ? '' : s + j) ;
}


function _s(i){
    return i<10 ? '0'+i : i;
}

function getTimeString(s){
    s = Number(s);
    var h = 0, m = 0, d = 0;
    if(s >= 86400){
        d = parseInt(s / 86400);
        s %= 86400;
    }    
    if(s >= 3600){
        h = parseInt(s / 3600);
        s %= 3600;
    }
    if(s >= 60){
        m = parseInt(s / 60);
        s %= 60;
    }
    if(m <= 0) m = 1;
    return _s2(d, '日')+_s2(h, '时')+_s2(m, '分')+'前';
}

function getGETArray() {
    var a_result = [], a_exp;
    var a_params = window.location.search.slice(1).split('&');
    for (var k in a_params) {
        a_exp = a_params[k].split('=');
        if (a_exp.length > 1) {
            a_result[a_exp[0]] = decodeURIComponent(a_exp[1]);
        }
    }
    return a_result;
}

function local_saveJson(key, data) {
    if (window.localStorage) {
        key = g_localKey + key;
        data = JSON.stringify(data);
        if(data == undefined) data = '[]';
        return localStorage.setItem(key, data);
    }
    return false;
}

function local_readJson(key, defaul = '') {
    if(!window.localStorage) return defaul;
    key = g_localKey + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}

function getLocalItem(key, defaul = '') {
    var r = null;
    if(window.localStorage){
        r = localStorage.getItem(g_localKey + key);
    }
    return r === null ? defaul : r;
}

function setLocalItem(key, value) {
    if(window.localStorage){
       return localStorage.setItem(g_localKey + key, value);
    }
    return false;
}

function randNum(min, max){
    return parseInt(Math.random()*(max-min+1)+min,10);
}

function getNow(){
    return parseInt(new Date().getTime());
}

function makeExpandingArea(el) {
    var timer = null;
    //由于ie8有溢出堆栈问题，故调整了这里
    var setStyle = function(el, auto) {
        if (auto) el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }
    var delayedResize = function(el) {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(function() {
            setStyle(el)
        }, 200);
    }
    if (el.addEventListener) {
        el.addEventListener('input', function() {
            setStyle(el, 1);
        }, false);
        setStyle(el)
    } else if (el.attachEvent) {
        el.attachEvent('onpropertychange', function() {
            setStyle(el)
        })
        setStyle(el)
    }
    if (window.VBArray && window.addEventListener) { //IE9
        el.attachEvent("onkeydown", function() {
            var key = window.event.keyCode;
            if (key == 8 || key == 46) delayedResize(el);

        });
        el.attachEvent("oncut", function() {
            delayedResize(el);
        }); //处理粘贴
    }
}

