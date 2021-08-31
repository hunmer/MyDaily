var g_v_grid_down = {
	start: 0,
	task: -1,
	element: null,
	holding: false
};

var g_v_clipboard;

String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

$(function() {

	window.history.pushState(null, null, "#");
	window.addEventListener("popstate", function(event) {
		window.history.pushState(null, null, "#");
		event.preventDefault(true);
		event.stopPropagation();

		var d = $('.modal.show');
		if(d.length > 0){
			d.modal('hide');
		}else
		if(g_viewing != ''){
			hideUI('chat_content');
		}
		//$('#modal1').modal('close');
	});

	$(document).on('click', '[data-action]', function(event) {
		var dom = $(this);
		console.log(dom);
		switch(dom.attr('data-action')){
			case 'setFace':
			var value = dom.attr('data-value');
			console.log(value);
			$('.face_active').removeClass('face_active');
			dom.find('svg').addClass('face_active');
			break;

			case 'createNew':
				g_v_active.icon_type = 'collection';
				$('#modal_craete_new').modal();
				break;

			case 'createNewQuestion':
				question_edit();
				break;

			case 'daily_editMode':
				daily_switch_editMode(dom);
				break;

			case 'question_up':
				var name = dom.parents().filter(".row").attr('data-value');
				var keys = Object.keys(g_v_questions);
				var i = keys.indexOf(name);
				if(i > 0){
					var c1 = keys.splice(i, 1)[0];
					keys.splice(i - 1, 0, c1);
					question_initKeys(keys);
				}
				break;

			case 'question_down':
				var name = dom.parents().filter(".row").attr('data-value');
				var keys = Object.keys(g_v_questions);
				var i = keys.indexOf(name);
				if(i >= 0 && i != keys.length - 1){
					var c1 = keys.splice(i, 1)[0];
					keys.splice(i + 1, 0, c1);
					question_initKeys(keys);
				}

				break;			

			case 'question_delete': // 从问题列表中移除
				var name = dom.parents().filter(".row").attr('data-value');
				confirm('Delete question : ' + name, {
					ok: function(){
						if(g_v_questions[name] != undefined){
							delete g_v_questions[name];
							local_saveJson('questions', g_v_questions);
							question_init();
						}
						if(g_viewing_qestion[name] != undefined){
							delete g_viewing_qestion[name];
							if(g_v_daily[g_viewing_day] != undefined){
								g_v_daily[g_viewing_day] = g_viewing_qestion;
								local_saveJson('daily', g_v_daily);
							}
						}
					},
					ok_text: 'deleted!',
					cancel: function(){}
				});
				break;

			case 'question_edit':
				question_edit(dom.parents().filter(".row").attr('data-value'));
				break;


		}
	});

	new ClipboardJS('#clipboard');
	$('body')
	.on('touchstart', '.chat_msg', function(event) {
				var dom = $(this);
				g_v_grid_down.start = getNow();
				g_v_grid_down.element = dom;
				g_v_grid_down.task = window.setTimeout(function(){
					if(g_v_grid_down.start > 0){
						console.log('长按');
						g_v_grid_down.holding = true;
						modal_show_msg_more();
					}
					g_v_grid_down.start = 0;
					g_v_grid_down.task = -1;
					event.originalEvent.preventDefault(true);
					event.originalEvent.stopPropagation();
				}, 1000);
			})
			.on('touchend', '.chat_msg', function(event) {
				if(g_v_grid_down.task != -1){
					window.clearTimeout(g_v_grid_down.task);
				}
				g_v_grid_down.start = 0;
				if(g_v_grid_down.holding){
					console.log('长按弹起');
					event.originalEvent.preventDefault(true);
					event.originalEvent.stopPropagation();
				}
				g_v_grid_down.holding = false;
		})
	.on('contextmenu', '.chat_msg', function(event){
		g_v_grid_down.element = $(this);
		modal_show_msg_more();

		event.originalEvent.preventDefault(true);
		event.originalEvent.stopPropagation();
	return false;
});;

	$('.inputArea textarea').keydown(function(event) {
		if(event.originalEvent.key == 'Enter' && event.originalEvent.ctrlKey){
			chat_send(this.value);
		}
	});
	/*$(window).scroll(function() {
	    var scrollTop = $(this).scrollTop();
	    var i = $(document).height() - (scrollTop + $(this).height());
	    if (i <= 30) {
	        //滚动条到达底部
	        if (!$('#pose-search').hasClass('hide')) {
	            var now = new Date().getTime() / 1000;
	            if (!g_b_loading && now - g_i_loading_last >= 3) {
	                g_i_loading_last = now;
	                g_b_loading = true;
	                g_v_poseSearch.page++;
	            }
	        }
	    } else if (scrollTop <= 0) {//滚动条到达顶部
	    }
	});	*/



	$('#tip').toast({delay: 3000});
 	icon_init_page();
icon_set_page(0);
		initCollection();

		//$('#modal_bottom').modal('show');
		initCardList();
		//$('#modal_card_list').modal('show');

		//ui_enter_collection('11');
		// 				$('#modal_msg_more').modal('show');
		//$('#pills-profile-tab')[0].click();
		$('.datePicker').datepicker({
			defaultViewDate: new Date(),
			autoclose: true,
		    todayBtn: true,
		    language: "zh-CN"
		}).on('changeDate', function(e) {
			daily_choose(e.format());
	        // `e` here contains the extra attributes
	    });
		g_viewing_qestion = question_get();
		question_init();
	    datePicker_addDate(0);
	    // $('#modal_question_edit').modal();


	    $('#chat_content').css('min-height', $(window).height());
});   

function question_set_type(){
	var modal = $('#modal_question_edit');
	var type = modal.find('#question_edit_type :selected').val();

	var d = g_v_questions_types[type] != undefined ? g_v_questions_types[type] : {
		html: '',
		script: ''
	};
	modal.find('#question_edit_html').val(d.html);
	$('#question_edit_html').css('height', 'unset'); // 修复这里的不会自适应高度
	makeExpandingArea($('#question_edit_html')[0]);
	// modal.find('#question_edit_script').val(d.script);
}
				
function question_edit(name){
	var modal = $('#modal_question_edit');
	var d = g_v_questions[name];
	var b = d == undefined;

	// 记录当前的数据
	if(!b){
		g_v_questions_types['Custom'] = {
			html: d.html,
			script: ''
		};		
	}

	modal.attr('data-value', b ? '' : name);
	modal.find('#question_edit_name').val(b ? '' : name);
	modal.find('#question_edit_type[value="Custom"]').prop('selected', 1);
	modal.find('.modal-title').html(b ? 'Add Question' : 'Edit Question');
	modal.find('#question_edit_html').val(b ? '' : d.html).css('height', 'unset');
	modal.find('#question_edit_tip').val(b ? '' : d.tip);
	modal.find('.done_btn').html(b ? 'Create' : 'Save');

	modal.modal();
}

function question_submit(){
	var modal = $('#modal_question_edit');
	var name = modal.find('#question_edit_name').val();
	var f = function(selector, msg){
		console.log(msg);
		if(msg != ''){
			modal.find('.invalid-feedback').hide();
			modal.find('.is-invalid').removeClass('is-invalid');

			modal.find(selector).addClass('is-invalid');
			return modal.find(selector).next('.invalid-feedback').html(msg).show();
		}
	}
	var type, html;
	if(name == ''){
		return f('#question_edit_name', 'Please enter question!');
	}

	if(
		modal.attr('data-value') != name &&
		g_v_questions[name] != undefined){
		return f('#question_edit_name', 'Question already existsed!');
	}

	if((html = modal.find('#question_edit_html').val()) == ""){
			return f('#question_edit_html', "html can't be empty!");
	}

	
	var old = modal.attr('data-value');
	if(g_v_questions[old] != undefined){
		delete g_v_questions[old];
	}

	g_v_questions[name] = {
		tip: modal.find('#question_edit_tip').val(),
        prop: [],
		html: html,
		script: ''
	}
	local_saveJson('questions', g_v_questions);
	g_viewing_qestion = g_v_questions;
	question_init();
	modal.modal('hide');
}


function question_initKeys(keys){
	var newQ = {};
	console.log(keys);
	for(var key of keys){
		if(g_v_questions[key] != undefined){
			newQ[key] = g_v_questions[key];
		}
	}
	g_v_questions = newQ;
	local_saveJson('questions', g_v_questions);
	question_init();
}

function confirm(text, params = {
	ok: function(){},
	cancel: function(){},
	ok_text: 'done',
	cancel_text: 'cancel'
}){
  hsycms.confirm('confirm',text,
     function(res){       
     	params.ok();     
       hsycms.success('success',params.ok_text);
     },
    function(res){
    	console.log(params);
    	params.cancel();
        hsycms.error('error',params.cancel_text);
     },
  )
}

function setCopyText(text){
	$('#clipboard_content').val(text);
	$('#modal_copy').modal('show');
}

function modal_show_msg_more(){
	$('#modal_msg_more').modal('show');
}
function icon_init_page(){
 var html = ``, name;
    
 for(var i=0;i<=parseInt(g_icons.length /30);i++){
		  	html = html + `<li class="col-1"><a class="page-link" href="javascript: icon_set_page(`+i+`)">`+i+`</a></li>`;
		  }

	$('#modal_select_icon .pages').html(html);
}


function icon_set_page(page){
 var html = '', name;
 let s = page*30;
 let e = s + 30;
 if(e > g_icons.length - 1){
 	e = g_icons.length - 1;
 }
 for(var i=s;i<=e;i++){
 	name = g_icons[i];
		  	html = html + `<a data-name="`+name+`" class="col-1" href="javascript: selectIcon('`+name+`');"><i class="material-icons">`+name+'</i></a>';
		  }
		$('#modal_select_icon #icon_list').html(html);
		//ui_enter_collection('tt');	
}

function chat_send(msg){
	if(msg == undefined) msg = $('.inputArea textarea').val();
	if(msg !== ''){
		var s;
		$('.inputArea textarea').val('');
		var data = {
			msg: msg,
			bookmark: false,
			tags: [],
			date: getNow(),
			type: getDefaultCardType()
		};
		s = $('.card_preview #card_title').html();
		if(s) data.title = s;
		s = $('.card_preview #card_img').attr('src');
		if(s) data.img = s;	
		s = $('.card_preview #card_from').html();
		if(s) data.from = s;		
		s = $('.card_preview #card_icon').html();
		if(s) data.icon = s;
		g_v_coll[g_viewing].data.push(data);
		local_saveJson('collections', g_v_coll);
		add_msg(data);

		// 更新集合最后消息的显示
		var d = $('.collection[data-name="'+g_viewing+'"]');
		d.find('.last_msg').html(msg);
		d.find('.last_date').html('Just Now');		
	}
	$('.card_preview').remove();
	card_init_form();
}

function getDefaultCardType(){
	return g_v_active['card_type'] != '' ? g_v_active['card_type'] : (g_v_coll[g_viewing].prop['card_type'] != undefined ? g_v_coll[g_viewing].prop['card_type'] : 'base');
}

function cards_getHtml(card){
	for(var d of g_cards){
		if(d.name == card) return d.html;
	}
	return g_cards[0].html;
}

function add_msg(data, ret = false){
	let date = new Date(data.date);
	var html = cards_getHtml(data.type);
	html = html.replace('{text}', data['msg'].trim().replaceAll("\n", "<p>")).replace('{date}', _s(date.getHours())+':'+_s(date.getMinutes()));

	if(data.title != undefined){
		html = html.replace('{title}', data.title);
	}
if(data.img != undefined){
		html = html.replace('{img}', data.img);
	}	
if(data.icon != undefined){
		html = html.replace('{icon}', data.icon);
	}	
	html = '<div class="chat_msg mt-auto bd-highlight" data-key='+data.date+'>'+html+'</div>'; 
	  if(ret){
	  	return html;
	  }
	$('#chat_content #content').append(html.replace('<div class="msg', '<div class="msg scale-in-hor-right'));
	scroll_to_end($('#chat_content #content'));
}

function scroll_to_end(dom, speed = 500){
	$('html,body').animate({ scrollTop: dom.height()}, speed);
}

function msg_delete(time){
	if(time == undefined) time = g_v_grid_down.element.attr('data-key');
	let i = 0;
	for(let d of g_v_coll[g_viewing].data){
		if(d.date == time){
			g_v_coll[g_viewing].data.splice(i, 1);
			console.log( g_v_coll[g_viewing].data);
			let dom = $('.chat_msg[data-key='+time+']');
			dom.removeClass('scale-in-hor-right').addClass('roll-out-right');
			setTimeout(function(){
				dom.remove();
			}, 600)
			local_saveJson('collections', g_v_coll);
		}
		i++;
	}
}

function modal_msg_more_action(action){
	switch(action){
		case 'copy':
			setCopyText(g_v_grid_down.element.find('#card_text').html());
			break;

		case 'delete':
			msg_delete();
			break;

	}
	$('#modal_msg_more').modal('hide');
	g_v_grid_down.element = undefined;
}

function showUI(id) {
    $('.ui').each(function(index, el) {
        if (el.id == id) {
            $(el).removeClass('hide');
        } else {
            $(el).addClass('hide');
        }
    });
}

function hideUI(id) {
    $('.ui').each(function(index, el) {
        if (el.id == id) {
            $(el).addClass('hide');
        } else {
        	$(el).removeClass('hide');
        }
    });
    g_viewing = '';
}

function selectIcon(icon){
	
	var selector;
	switch(g_v_active.icon_type){
		case 'input':
			selector = '.card_preview #card_icon';
			break;

		case 'collection':
			selector = '#selected_icon';
			break;
	}
	$(selector).html('<i class="material-icons">'+icon+'</i>');
	$('#modal_select_icon').modal('hide');	
}

function addCollection(name){
	if(g_v_coll[name] == undefined){
		g_v_coll[name] = {
			create_at: getNow(),
			desc: $('#new_desc').html(),
			icon: $('#selected_icon').html(), // 图标
			prop: {}, // 属性
			data: [] // 数据列表
		};	
		local_saveJson('collections', g_v_coll);
		initCollection();
		return true;
	}
	return false;
}

function collection_create_new(){
	let name = $('#new_name');
	if(name.val() == '' && !name.hasClass('is-invalid')){
		setFormTip(name, false, 'Please provide a valid name.');
		return;
	}
	if(!addCollection(name.val())){
		setFormTip(name, false, 'name : '+name.val()+' is already existsed!');
	}else{
		$('#modal_craete_new').modal('hide');
		tip('done!', '', `created `+name.val()+'!');
	}
}

function setFormTip(dom, success = false, tip = ''){
	dom.addClass(success ? 'is-valid' : 'is-invalid').next(success ? '.valid-feedback' : '.invalid-feedback').html(tip);
}

function initCollection(){
	var html = '', data, last, now = getNow();

	for(let name in g_v_coll){
		data = g_v_coll[name];
		var list = data.data;
		var max = list.length;
		if(max == 0){
			last = {
				msg: '...'
			};
		}else{
			last = list[list.length - 1];
		}

		
		html = html +`<div class="row p-3 mb-2 shadow-sm collection" data-name="`+name+`">
    <div class="col-1"  onclick="ui_enter_collection('`+name+`')">
      <div class="rounded-circle bg-dark"><i class="material-icons text-white w-100 text-center" style="font-size: 1.5em">
			  	`+(data.icon == '' ? 'book' : data.icon)+`</i>
			  	</div>
    </div>
    <div class="col ml-4" onclick="ui_enter_collection('`+name+`')"><b style="font-size: 1.5em; line-height: 0px;">`+name+`</b></br><span class="last_msg">`+last.msg+`</span></div>
    <div class="col-4 text-right">
		<svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-three-dots-vertical dropdown-toggle pb-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
		  <path fill-rule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
		</svg>	</br><small class="last_date">
		`+(last.date != undefined ? getTimeString((now - last.date) / 1000) : '')+`</small>
		  <div class="dropdown-menu">
		    <a class="dropdown-item" href="javascript: confirm_collection_delete('`+name+`');">Delete</a>
		    <div class="dropdown-divider"></div>
		    <a class="dropdown-item" href="#">...</a>
		  </div>
		</div>    	
    </div>
   
  </div>`;

		/*html = html + `
			  <div class="card-body">

			  <div class="btn-group dropleft float-right">
    <svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-three-dots-vertical dropdown-toggle" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
  <path fill-rule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>	
  <div class="dropdown-menu">
    <a class="dropdown-item" href="javascript: confirm_collection_delete('`+name+`');">Delete</a>
    <div class="dropdown-divider"></div>
    <a class="dropdown-item" href="#">...</a>
  </div>
</div>

			  <div class="header d-flex" onclick="ui_enter_collection('`+name+`')">
			  	<div class="rounded-circle bg-dark"><i class="material-icons text-white w-100 text-center">
			  	`+(data.icon == '' ? 'book' : data.icon)+`</i>
			  	</div>
			  	<h3 class="pl-3">`+name+`</h3>
			  	</div>
</br>
<span>`+last.msg+`</span>
</br>
<span class="float-right">`+(last.date != undefined ? getTimeString((now - last.date) / 1000) : '')+`</span>
			  </div>
			</div>
		`;*/
	}
	$('#list').html(html);

	// 图标垂直居中
	$('#list .rounded-circle i').each(function(i, d){
		$(d).css('lineHeight', d.parentElement.offsetHeight+'px');
	});	

}

var g_viewing = ''; // 正在浏览的名称
function ui_enter_collection(name){
	g_viewing = name;
	var con = $('#chat_content');
	con.attr('data-collection', name);
	con.find('b').html(name);


	var html = '<span class="badge rounded-pill bg-info text-dark mx-auto mb-2">New Channel : ' + name + '</span>';
	if(g_v_coll[name] != undefined){
		let data = g_v_coll[name];
		con.find('small').html(data.data.length);

		for(let d of data.data){
			html = html + add_msg(d, true);
		}
	}
	con.find('#content').html(html);
	showUI('chat_content');
	card_init_form();
	scroll_to_end($('#chat_content #content'), 0);
}

function ui_enter_timeline(){
	var msgs = [];
	var html = '';
	for(let name in g_v_coll){
		for(let chat of g_v_coll[name].data){
			//msgs[chat.date] = chat;
			html = html + add_msg(chat, true);
		}
	}
	//console.log(msgs);
	// <span class="badge rounded-pill bg-info text-dark mx-auto">New Channel : ' + name + '</span>
	$('#timeline_content').html(html);
	scroll_to_end($('#timeline'), 0);
}

function confirm_collection_delete(name){
	var modal = $('#modal_custom');
	modal.find('.modal-title').html('Delete Collection');
	$('.modal-body').html('Are you want to delete the collection : ' + name +'?');
	modal.find('.btn-primary')[0].onclick = function(){
		let res = collection_delete(name);
		hsycms.tips('tips', res ? 'done!' : 'error!', function(){}, 2000)
		modal.modal('hide');
	}
	modal.modal('show');
}

function collection_delete(name){
	if(g_v_coll[name] != undefined){
		delete g_v_coll[name];
		local_saveJson('collections', g_v_coll);
		initCollection();
		return true;		
	}
	return false;
}

function downloadData(){
 	var eleLink = document.createElement('a');
	eleLink.download = 'myDaily['+new Date().toDateString()+'].json';
	eleLink.style.display = 'none';
	var blob = new Blob([JSON.stringify(g_v_coll)]);
	eleLink.href = URL.createObjectURL(blob);
	document.body.appendChild(eleLink);
	eleLink.click();
	document.body.removeChild(eleLink);	
}

  function uploadFile(){
      var file = $('#upload')[0].files[0];
       var reader = new FileReader();
       reader.readAsText(file);
       reader.onload = function(e){
        try {
          json = JSON.parse(this.result);
          for(var name in json){
          	g_v_coll[name] = json[name];
          }
           local_saveJson('collections', g_v_coll);
            initCollection();
        }
        catch(err){
          alert('Corrupted data!');
        }
       }
    }

var g_cards = [
	{
		name: "base",
		html: `<div class="alert alert-success" role="alert">
  <span class="mr-2" id="card_text">{text}</span><p>
  <span class="float-right" id="card_date">{date}</span>
</div>`,
	},
	{
		name: "title",
		html: `<div class="alert alert-success" role="alert">
  <h4 class="alert-heading" id="card_title">{title}</h4>
  <p id="card_text">{text}</p>
  <hr>
  <p class="mb-0 text-right" id="card_date">{date}</p>
</div>`,
	},
	{
		name: "card",
		html: `<div class="card border-success mb-3 mr-0">
  <div class="card-header bg-transparent border-success" id="card_icon">{icon}</div>
  <div class="card-body text-success">
    <h5 class="card-title" id="card_title">{title}</h5>
    <p class="card-text pl-2" id="card_text">{text}</p>
  </div>
  <div class="card-footer bg-transparent border-success text-right" id="card_date">{date}</div>
</div>`
	},
	{
		name: "quote",
		html: ` <div class="card p-3">
    <blockquote class="blockquote mb-0 card-body">
      <p id="card_text">{text}</p>
      <footer class="blockquote-footer">
        <small class="text-muted" id="card_from">
          {from}
        </small>
      </footer>
    </blockquote>
  </div>`,
	},
	{
		name: "signle-image",
		html: ` <div class="card">
      <img id="card_img" src="{img}" style="max-width: 300px; " class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title" id="card_title">{title}</h5>
        <p class="card-text pl-2" id="card_text">{text}</p>
        <p class="card-text float-right"><small class="text-muted" id="card_date">{date}</small></p>
      </div>
    </div>`
	}
];
function cards_getList(){
	return g_cards;
}
$('.card_list .form-check:checked')
function initCardList(){
	var html = '', id;
	for(var card of cards_getList()){
		id = 'radio_' + card.name;
		html = html + `<div class="card_list shadow-lg mb-5 p-2 ">
		<div class="form-check  text-center">
  <input class="form-check-input" onchange="$('.card_list input[type=radio]').prop('checked', false); $(this).prop('checked', true)" type="radio" name="`+id+`" id="`+id+`" value="`+card.name+`">
  <label class="form-check-label" for="`+id+`">
   `+card.name+`
  </label>
</div>
		`+card_getPreviewHtml(card.html)+`</div>`;
	}
	html = html + '';
	$('#modal_card_list .modal-body').html(html);
}

function card_getPreviewHtml(html){
	return html.replace('{img}', './imgs/demo.jpg').replace('{icon}', '<i class="material-icons">star</i>');
}

function confirm_select_card_type(){
	var type = $('.card_list .form-check :checked').val();
	if($('#option_card_setDefault').prop('checked')){
		g_v_coll[g_viewing].prop['card_type'] = type;
		saveData();
	}else{
		g_v_active['card_type'] = type;
	}
	$('#modal_card_list').modal('hide');
	card_init_form();
}

function card_init_form(type = ''){
	if(type == '') type = getDefaultCardType();
	var html = cards_getHtml(type);
	var r = '';
	if(html.indexOf('{title}') != -1){
		r = r + `<div class="">
    <label for="card_input_title">Title</label>
    <input type="text" class="form-control w-50" id="card_input_title" placeholder="..." oninput="apply_input('title')">
  </div>`
	}
	if(html.indexOf('{text}') != -1){
			r = r + `<div class="">
	    <label for="card_input_text">Content</label><p>
	    <textarea class="w-75" id="card_input_text" placeholder="..."  oninput="apply_input('text')"></textarea>
	  </div>`
		}
if(html.indexOf('{icon}') != -1){
			r = r + `<button type="button" class="btn btn-primary " data-toggle="modal" data-target="#modal_select_icon" onclick="g_v_active.icon_type = 'input';">Set icon</button>  `
		}
if(html.indexOf('{from}') != -1){
		r = r + `<div class="">
    <label for="card_input_from">From</label>
    <input type="text" class="form-control" id="card_input_from" placeholder="..." oninput="apply_input('from')">
  </div>`
	}	
if(html.indexOf('{img}') != -1){
		r = r + `
		<div class="row">
		 <div class="custom-file col ml-3">
      <input type="file" class="custom-file-input" id="card_input_image"  accept="image/*" onchange="uploadImage()" required>
      <label class="custom-file-label" for="card_input_image">Choose file...</label>
    </div>
    <div class="input-group-append col-3">
       <button class="btn btn-outline-secondary" type="button" onclick="$('#card_input_image').val('');">Clear</button>
    </div></div>`;
	}	
	if(r == ''){
		r = `<textarea id='textarea' autofocus required contenteditable="true" class="form-control" rows="2" placeholder="write something in here..." style="resize: none;"></textarea>`;
	}
	$('#chat_input').html(r);
	$('.card_preview').remove();

	var html = card_getPreviewHtml(cards_getHtml(type));
	let dom = $(html).addClass('card_preview');
	// html = html.replace('{text}', data['msg'].trim().replaceAll("\n", "<p>")).replace('{date}', _s(date.getHours())+':'+_s(date.getMinutes()));
	dom.appendTo('#chat_content #content');
	//scroll_to_end($('#chat_content #content'), 0);
}

function apply_input(type){
	$('.card_preview #card_'+type).html($('#card_input_'+type).val());
}

function uploadImage(){
  var file = $('#card_input_image')[0].files[0];
       var reader = new FileReader();
       reader.readAsDataURL(file);
       reader.onload = function(e){
        try {
          $('.card_preview #card_img').attr('src', this.result);
        }
        catch(err){
          alert('Corrupted data!');
        }
       }	
}

var g_v_active = {
	card_type: '', // 仅作用一此的卡片类型
	icon_type: '', // 选中图标后处理的类型
}

function saveData(){
	local_saveJson('collections', g_v_coll);
	initCollection();	
}

function modal_open_card_list(){
	var dom = $('.card_list .form-check input[value="'+getDefaultCardType()+'"]');
	if(dom.length > 0) dom.prop('checked', true);
	$('#option_card_setDefault').prop('checked', g_v_coll[g_viewing].prop['card_type'] != undefined);
	$('#modal_card_list').modal('show');

}

function question_get(){
	return g_v_questions;
}

var g_viewing_qestion;

function question_init(){
	let show = $('svg[data-action="daily_editMode"]').hasClass('text-primary') ? '' : ' hide';
	let h = '', id = '', d, questions = question_get();
	for(var q in questions){
		d = questions[q];
		id = 'collapseOne_'+q;
		h = h + `<div class="accordion" id="accordion-`+id+`">
  <div class="card">
    <div class="card-header">
    <div class="row" data-value="`+q+`">
      <div class="col-5">
        <a class="stretched-link text-left w-100" type="button" data-toggle="collapse" data-target="#`+id+`" aria-expanded="true" aria-controls="`+id+`">
         `+q+`
        </a>
      </div>
      <div class="col text-right">
       <svg data-action="question_edit" width="1.5em" height="1.5em" viewBox="0 0 16 16" data-action="daily_editMode" class="bi bi-pencil-fill"`+show+` fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
</svg>

      <svg data-action="question_up" width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-up-fill"`+show+`" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M7.247 4.86l-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
</svg>
<svg data-action="question_down" width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-caret-down-fill"`+show+`" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
</svg>
 <svg width="2em" height="2em" viewBox="0 0 16 16" data-toggle="tooltip" data-placement="top" title="`+d.tip+`" class="bi bi-question" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
</svg>      

            <svg  data-action="question_delete" width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-trash-fill"`+show+`" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z"/>
</svg>
      </div>
      </div>
    </div>

    <div id="`+id+`" class="daily_input collapse show p-2" data-parent="#accordion-`+id+`">
    `+d.html+`
    </div>
  </div>`;
	}
	if(h == ''){
		h = h + `<h3>Nothing in here</h3>`;
	}else{
		h = h + `
			<div class="col-12 d-flex pt-2">
			<div class="col-2">&nbsp;</div>
			<button type="button" class="btn btn-secondary col" onclick="question_init();">Reset</button>
			<div class="col-2">&nbsp;</div>
			<button type="button" class="btn btn-primary col" onclick="daily_save();">Save</button>
			<div class="col-2">&nbsp;</div>
			</div>
			`;		
	}
	$('#daily_content').html(h);
	$('[data-toggle="tooltip"]').tooltip();
	var val, parent;
	for(var q in g_viewing_qestion){
		val = g_viewing_qestion[q].value;
		if(val != undefined){
			parent = $('#collapseOne_'+q);

			d = parent.find('[value="'+val+'"]');
			if(d.length > 0){ // 选项
				d.prop(parent.find('select').length > 0 ? 'selected' : 'checked', true);
			}else{
				parent.children().val(val); // 文本输入
			}
		}
	}
}

function daily_save(){
	var s, d;
	for(var q in g_viewing_qestion){
		s = $('#collapseOne_'+q);
		d = s.find(':checked');
		if(d.length > 0){ // 选项
			val = d.val();
		}else{
			val = s.children().val();
		}
		//console.log(val);
		g_viewing_qestion[q].value = val;
	}
	var d = new Date($('.datePicker').datepicker('getDate'));
	/*var n = new Date();
	if(d.getTime() > n.getTime() && d.getMonth() != n.getMonth() && d.getDay() != n.getDay()){
		console.log('超过今日时间');
		return;
	}*/
	g_v_daily[addDate(0)] = g_viewing_qestion;
	local_saveJson('daily', g_v_daily);
	hsycms.tips('tips', 'saved!', function(){}, 2000);
}

 function alertMessage(html){
    var d = $('#alert');
    d.find('.alert_content').html(html);
    d.addClass('show').alert();
    setTimeout(function(){
    	d.removeClass('show').alert('close');
    }, 3000);
  }

var g_viewing_day; // 当前浏览的日期

function daily_choose(date){
	if(!date) date = addDate(0,  $('.datePicker').datepicker('getDate'));
	g_viewing_day = date;
	g_viewing_qestion = g_v_daily[date] != undefined ? g_v_daily[date] : question_get();
	question_init();

}

// 日期选择方法 days=增减的天数
function datePicker_addDate(days){
	var d = $('.datePicker').datepicker('getDate');
	var t = new Date();
	if(d == undefined){
		d = t; // 今天
	}
	if(days > 0 && addDate(0, d) == addDate(0, t)) return; // 不能找过今天
	$('.datePicker').datepicker('update', addDate(days, d));
	daily_choose();
}

// 增减时间并返回文本 days=增减的天数 d=原日期
 function addDate(days, d){
 	if(!d) d = new Date(); 
       d.setDate(d.getDate()+days); 
       var m=d.getMonth()+1; 
       return d.getFullYear()+'-'+m+'-'+d.getDate(); 
} 

function modal_open_questionList(){
	for(var q in g_viewing_qestion){

	}
}

function daily_switch_editMode(dom){
	dom.toggleClass('text-primary');
	//if(dom.hasClass('text-primary')){
		$('#daily_content svg').each(function(i, d){
			$(d).toggleClass('hide');;
		})
	//}
}