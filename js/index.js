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

	$(document).on('click', 'svg[data-action]', function(event) {
		var dom = $(this);
		switch(dom.attr('data-action')){
			case 'createNew':
				$('#modal_craete_new').modal();
				break;
		}
	});

	$('.inputArea input').keydown(function(event) {
		if(event.originalEvent.key == 'Enter'){
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
});   

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
 console.log(s, e);
 for(var i=s;i<=e;i++){
 	name = g_icons[i];
		  	html = html + `<a data-name="`+name+`" class="col-1" href="javascript: selectIcon('`+name+`');"><i class="material-icons">`+name+'</i></a>';
		  }
		$('#modal_select_icon #icon_list').html(html);
		//ui_enter_collection('tt');	
}

function chat_send(msg){
	if(msg !== ''){
		$('.inputArea input').val('');
		var data = {
			msg: msg,
			bookmark: false,
			tags: [],
			date: getNow()
		};
		g_v_coll[g_viewing].data.push(data);
		local_saveJson('collections', g_v_coll);
		add_msg(data);
	}
}

function add_msg(data, ret = false){
	let sec = data.date;
	let date = new Date(sec);
	let html = `
	<div class="msg col-12" data-time=`+sec+`>
	<div class="card text-white bg-info mb-3">
		<div class="card-header">`+_s(date.getHours())+':'+_s(date.getMinutes())+`

			  <div class="btn-group dropleft float-right">
    <svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-three-dots-vertical dropdown-toggle" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
  <path fill-rule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>	
  <div class="dropdown-menu">
    <a class="dropdown-item" href="javascript: msg_delete('`+sec+`');">Delete</a>
    <div class="dropdown-divider"></div>
    <a class="dropdown-item" href="#">...</a>
  </div>
</div>

		</div>
	  <div class="card-body">
	    <h5 class="card-title"></h5>
	    <p class="card-text text-left">`+data.msg+`</p>
	<div class="float-right text-right">
	</div>	    
	  </div></div>
	  </div>`;
	  if(ret){
	  	return html;
	  }
	$('#chat_content #content').append(html.replace('<div class="msg', '<div class="msg scale-in-hor-right'));
}

function msg_delete(time){
	let i = 0;
	for(let d of g_v_coll[g_viewing].data){
		if(d.date == time){
			g_v_coll[g_viewing].data.splice(i, 1);
			console.log( g_v_coll[g_viewing].data);
			let dom = $('.msg[data-time='+time+']');
			dom.removeClass('scale-in-hor-right').addClass('roll-out-right');
			setTimeout(function(){
				dom.remove();
			}, 600)
			local_saveJson('collections', g_v_coll);
		}
		i++;
	}
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
	$('a[data-name].active').removeClass('active');
	$('a[data-name="'+icon+'"]').addClass('active');
	$('#selected_icon').html('<i class="material-icons">'+icon+'</i>');
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
	var html = '', data, last;

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
			var d = new Date(last.date);			
		}
		
		html = html + `
			<div class="card shadow-sm p-3 mb-2 bg-white rounded" >
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
			  	<div class="rounded-circle"><i class="material-icons">
			  	`+(data.icon == '' ? 'book' : data.icon)+`</i>
			  	</div>
			  	<h3 class="pl-3">`+name+`</h3>
			  	</div>
</br>
<span>`+last.msg+`</span>
</br>
<span class="float-right">`+(d != undefined ? d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds() : '')+`</span>


			  </div>
			</div>
		`;
	}
	$('#list').html(html);
}

var g_viewing = ''; // 正在浏览的名称
function ui_enter_collection(name){
	g_viewing = name;
	var con = $('#chat_content');
	con.attr('data-collection', name);
	con.find('span').html(name);

	var html = '';
	if(g_v_coll[name] != undefined){
		let data = g_v_coll[name];
		for(let d of data.data){
			html = html + add_msg(d, true);
		}
	}
	con.find('#content').html(html);
	showUI('chat_content');
}

function confirm_collection_delete(name){
	var modal = $('#modal_custom');
	modal.find('.modal-title').html('Delete Collection');
	$('.modal-body').html('Are you want to delete the collection : ' + name +'?');
	modal.find('.btn-primary')[0].onclick = function(){
		let res = collection_delete(name);
		tip(res ? 'done!' : 'error!', '', 'delete collection : ' + name + ' : ' + res ? 'success!' : 'failure!');
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

function tip(title = 'Tip', desc = '', body = ''){
	var tip = $('#tip');
	tip.find('strong').html(title);
	tip.find('small').html(desc);
	tip.find('.toast-body').html(body);
	//tip.show();
	tip.toast('show');
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
          if(Object.keys(json).length > 0){
             g_v_coll = json;
             local_saveJson('collections', g_v_coll);
            initCollection();
          }
        }
        catch(err){
          alert('Corrupted data!');
        }
       }
    }
