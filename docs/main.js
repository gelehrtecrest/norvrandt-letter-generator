(function($){
	WebFont.load({
		custom: {
			families: ['Norvrandt'],
			urls: ['style.css']
		},
		loading: function() {
			console.log('loading');
		},
		active: function() {
			console.log('active');
		},
		inactive: function() {
			console.log('inactive');
		},
		fontloading: function(familyName, fvd) {
			console.log('fontloading', familyName, fvd);
		},
		fontactive: function(familyName, fvd) {
			console.log('fontactive', familyName, fvd);
		},
		fontinactive: function(familyName, fvd) {
			console.log('fontinactive', familyName, fvd);
		}
	});

	//画像関連
	var img;
	var img2;
	var stage;

	//画像ロード
	/*
	function loadImage (imageData, logoImageData){
		//画像のロード
		//画像が選択されている時のみ合成
		if(imageData !== null) {
			var baseImg2 = new Image();
			baseImg2.src = imageData;
			img2 = new createjs.Bitmap(baseImg2);
			$('#result').attr({
				'width': baseImg2.width,
				'height': baseImg2.height
			});
		}

		stage = new createjs.Stage('result');
	}
	*/

	//ロゴを合成する処理
	function genImage (imageIni){
		// 文字合成
		var content = $('#text').val();
		img = new createjs.Text(content);
		img.color = $('#color').val();
		var px = $('#px').val().slice( 0, -2 ) * (1 + imageIni.Scale / 10);
		img.font = $('#style').val() + ' ' + px + 'px' + $('#font').val();

		//合成画像の設定
		//回転
		img.rotation = imageIni.rotation;
		//回転の中心は、画像の中央
		img.regX = img.getBounds().width / 2;
		img.regY = img.getBounds().height / 2;
		//上下は10ピクセルごと移動
		img.x = imageIni.xPos * 10 + img.getBounds().width / 2;
		img.y = imageIni.yPos * 10 + img.getBounds().height / 2;
		//拡縮は10％ずつ
		//img.scaleX = img.scaleX * (1 + imageIni.Scale / 10);
		//img.scaleY = img.scaleY * (1 + imageIni.Scale / 10);

		//透明化
		img.alpha = imageIni.alpha;	
	
		//影
		//影をつけるかチェック
		if($("#color_shadow_flag").prop("checked")){
			try{
				var shadow = new createjs.Shadow($('#color_shadow').val(), 4, 4, imageIni.shadow);
				img.shadow = shadow;
			} catch(e){
			}
		}


		$('#result').attr({
			'width': img.getBounds().width + imageIni.widthOffset,
			'height': img.getBounds().height + imageIni.heightOffset
		});

		stage = new createjs.Stage('result');

		//ステージ生成
		//stage.addChild(img2);
		stage.addChild(img);

		//ステージ反映
		stage.update();
	}

	$(function(){
		//設定のデフォルト値
		$('#text').val('Hello Norvrandt');
		$('#color').val('white');
		$('#color_shadow').val('#cb8a00');
		$('#style').val('bold');
		$('#font').val("/1.5 'Norvrandt','ヒラギノ明朝 ProN','Hiragino Mincho ProN','Sawarabi Mincho','Noto Serif CJK JP','MS PMincho',serif");
		$('#px').val('48px');

		//読込画像のオブジェクト
		var imageIni = {
			xPos : 1,
			yPos : 1,
			Scale : 0,
			rotation : 0,
			alpha : 1.0,
			shadow : 40,
			widthOffset : 20,
			heightOffset : 20,
			imageData : null,
			logoImageData : null,
			resetImage : function(){
				this.xPos = 8;
				this.yPos = 8;
				this.Scale = 8;
			},
			makeImage : function(){
				//if(this.imageData !== null) {
					//loadImage(this.imageData, this.logoImageData);
					genImage(this);
				//}
			}
		};

		//get情報
		var url = location.href;
		var parameters = url.split('?');
		var queries = (parameters[1] || 'dummy=dummy').split('&');
		i = 0;

		for(i; i < queries.length; i ++) {
			var t = queries[i].split('=');
			if(t['0'] == 'logourl'){
				$('#logourl').val(decodeURIComponent(t['1']));
			} else if(t['0'] == 'xpos'){
				imageIni.xPos = parseFloat(t['1']);
			} else if(t['0'] == 'ypos'){
				imageIni.yPos = parseFloat(t['1']);
			} else if(t['0'] == 'scale'){
				imageIni.Scale = parseFloat(t['1']);
			} else if(t['0'] == 'text'){
				$('#text').val(decodeURIComponent(t['1']));
			} else if(t['0'] == 'color'){
				$('#color').val(decodeURIComponent(t['1']));
			} else if(t['0'] == 'style'){
				$('#style').val(decodeURIComponent(t['1']));
			} else if(t['0'] == 'font'){
				$('#font').val(decodeURIComponent(t['1']));
			} else if(t['0'] == 'px'){
				$('#px').val(decodeURIComponent(t['1']));
			} else if(t['0'] == 'title'){
				$('title').text(decodeURIComponent(t['1']));
				$('h1').text(decodeURIComponent(t['1']));
			} else if(t['0'] == 'comment'){
				$('#comment').text(decodeURIComponent(t['1']));
			}
		}

		//イベント関連処理
		//画像読込
		$('#getfile').change(function (){
			//読み込み
			var fileList =$('#getfile').prop('files');
			var reader = new FileReader();
			reader.readAsDataURL(fileList[0]);

			//読み込み後
			$(reader).on('load',function(){
				$('#preview').prop('src',reader.result);
				imageIni.imageData = reader.result;
			});
		});

		$(document).on('input', '.input', function() {
			//input操作時は再描画を行う
			if(imageIni.imageData !== null){
				imageIni.makeImage();
			}else{
				$('#alert').text('スクリーンショットを入力してから画像生成を行ってください');
			}

			//input操作時はURLを再生成する
			write_settingurl(imageIni);
		});
		var editgenerator_button = "";
		var flag = 0;
		// 加速機能
		const boost_limit = 5;
		const boost_value = 3;
		const boost_not_value = 1;
		var boost_count = 0;
		const boost_id_default = "boost";
		var boost_id = boost_id_default;
		function boost(id){
			if(boost_id === id){
				boost_count += 1;
			} else {
				boost_count = 0;
				boost_id = id;
			}
			if(boost_count >= boost_limit){
				return boost_value;
			}
			return boost_not_value;
		}
		function editgenerator(id){
			if(flag == 0){
				flag = 1;
				return;
			} else {
				flag = 0;
			}
			if (id === 'update'){
			}else if (id === 'up'){
				imageIni.yPos -= 1*boost(id);
			}else if (id === 'down'){
				imageIni.yPos += 1*boost(id);
			}else if (id === 'left'){
				imageIni.xPos -= 1*boost(id);
			}else if (id === 'right') {
				imageIni.xPos += 1*boost(id);
			}else if (id === 'zoomin') {
				imageIni.Scale += 1*boost(id);
			}else if (id === 'zoomout') {
				imageIni.Scale -= 1*boost(id);
			}else if (id === 'rotation_r') {
				imageIni.rotation += 7.5*boost(id);
			}else if (id === 'rotation_l') {
				imageIni.rotation -= 7.5*boost(id);
			}else if (id === 'alpha_up') {
				imageIni.alpha += 0.1*boost(id);
				if(imageIni.alpha >= 0.9){
					imageIni.alpha = 1.0;
					$('#alpha_up').prop("disabled", true);
				}
				$('#alpha_down').prop("disabled", false);
			}else if (id === 'alpha_down') {
				imageIni.alpha -= 0.1*boost(id);
				if(imageIni.alpha <= 0.1){
					imageIni.alpha = 0.0;
					$('#alpha_down').prop("disabled", true);
				}
				$('#alpha_up').prop("disabled", false);
			}else if (id === 'reset'){
				imageIni.resetImage();
				boost(boost_id_default);
				$('#alpha_up').prop("disabled", true);
				$('#alpha_down').prop("disabled", false);
			}else if (id === 'widthOffset_up') {
				imageIni.widthOffset += 10*boost(id);
			}else if (id === 'widthOffset_down') {
				imageIni.widthOffset -= 10*boost(id);
			}else if (id === 'heightOffset_up') {
				imageIni.heightOffset += 10*boost(id);
			}else if (id === 'heightOffset_down') {
				imageIni.heightOffset -= 10*boost(id);
			}else if (id === 'dl'){
				return;
			}

			//画像操作時は再描画を行う
			//if(imageIni.imageData !== null){
				$('#alert').text('合成作業開始中です。');
				imageIni.makeImage();
				$('#alert').text('合成完了です！');
			//}else{
			//	$('#alert').text('スクリーンショットを入力してから画像生成を行ってください');
			//}

			//画面操作時はURLを再生成する
			write_settingurl(imageIni);
		}
		//$('.btn').on('click', function(e){
		//	editgenerator_button = e.target.id;
		//	editgenerator(editgenerator_button);
		//});

		var pushing_flag = 0;
		var mouse_push_hold = function(){
			editgenerator(editgenerator_button);
			if( pushing_flag == 1 ){
				setTimeout(mouse_push_hold, 100);
			}
		};

		// PC用
		$(".editgenerator").mousedown(function(e){
			editgenerator_button = e.target.id;
			pushing_flag = 1;
			setTimeout(mouse_push_hold, 1);
			return false;
		}).mouseup(function(){
			pushing_flag = 0;
			clearTimeout(mouse_push_hold);
			boost(boost_id_default);
		}).mouseleave(function(){
			pushing_flag = 0;
			clearTimeout(mouse_push_hold);
			boost(boost_id_default);
		}).mouseover(function(){
			pushing_flag = 0;
			clearTimeout(mouse_push_hold);
		});

		//スマホ用
		$(".editgenerator").bind('touchstart', function(e){
			editgenerator_button = e.target.id;
			pushing_flag = 1;
			setTimeout(mouse_push_hold, 1);
			return false;
		});
		$(".editgenerator").bind('touchend', function(e){
			pushing_flag = 0;
			boost(boost_id_default);
			return false;
		});




		$('input[name=logo]').click(function() {
			//チェックボックス操作時は再描画を行う
			if(imageIni.imageData !== null){
				imageIni.makeImage();
			}else{
				$('#alert').text('スクリーンショットを入力してから画像生成を行ってください');
			}

			//チェックボックス操作時はURLを再生成する
			write_settingurl(imageIni);
		});

		//初回URL生成
		write_settingurl(imageIni);

		//Canvas Download
		$('#btnDownload').on("click", function() {
			$('#alert').text('ダウンロード ボタンクリック');
			//if($('input[name=logo]:checked').val() === 'local'){
				DownloadStart();
			//} else if($('input[name=logo]:checked').val() === 'local_white'){
			//	DownloadStart();
			//} else {
			//	alert('ロゴがURL指定のため、ダウンロードボタンは使用できません。')
			//}
			$('#alert').text('ダウンロード処理終了');
		});
		$('#btnNewWindow').on("click", function() {
			NewWindow();
		});
		// 詳細設定の開閉
		var setting_more_flag = false;
		$('#setting_more_btn').click(function () {
			if(setting_more_flag){
				setting_more_flag = false;
		 		$('#setting_more').hide('slow');
				$('#setting_more_btn').text("詳細設定を開く");	
			} else {
				setting_more_flag = true;
        			$('#setting_more').show('slow');
				$('#setting_more_btn').text("詳細設定を閉じる");	
			}
		});
		$('.color_button').click(function(e) {
			var id = e.target.id
			if(id == "color_white"){
				$('#color').val("white");
			} else if(id == "color_blue"){
               			$('#color').val("blue");
	         	} else if(id == "color_green"){
 				$('#color').val("green");
	                } else if(id == "color_yellow"){
 				$('#color').val("yellow");
	                } else if(id == "color_red"){
 				$('#color').val("red");
	                } else if(id == "color_black"){
 				$('#color').val("black");
	                }
		});
		$('.color_shadow_button').click(function(e) {
			var id = e.target.id
			if(id == "color_shadow_white"){
				$('#color_shadow').val("white");
			} else if(id == "color_shadow_blue"){
               			$('#color_shadow').val("blue");
	         	} else if(id == "color_shadow_green"){
 				$('#color_shadow').val("green");
	                } else if(id == "color_shadow_yellow"){
 				$('#color_shadow').val("yellow");
	                } else if(id == "color_shadow_red"){
 				$('#color_shadow').val("red");
	                } else if(id == "color_shadow_black"){
 				$('#color_shadow').val("black");
	                }
		});



	});

	// URL生成
	function geturl(imageIni) {
		var url;
		var baseurl = location.href.split('?')[0];
		url = baseurl;

		//設定をgetに追加
		//text
		url = url + '?text=' + encodeURIComponent($('#text').val());
		url = url + '&color=' + encodeURIComponent($('#color').val());
		url = url + '&px=' + encodeURIComponent($('#px').val());
		url = url + '&style=' + encodeURIComponent($('#style').val());
		url = url + '&font=' + encodeURIComponent($('#font').val());
		//ロゴ位置・サイズ
		url = url + '&xpos=' + imageIni.xPos;
		url = url + '&ypos=' + imageIni.yPos;
		url = url + '&scale=' + imageIni.Scale;
		//ロゴ読み出し場所
		if($('input[name=logo]:checked').val() === 'local'){
			url = url + '&logo=local';
		}
		//タイトル
		url = url + '&title=' + encodeURIComponent($('title').text());
		//コメント
		url = url + '&comment=' + encodeURIComponent($('#comment').text());
		return url;
	}

	// URL書き込み
	function write_settingurl(imageIni) {
		var url = geturl(imageIni);
		$('#settingurl a').text(url);
		$('#settingurl a').attr('href', url);
	}
})($);

function DownloadStart(){
	
	var cve = document.getElementById("result");
	if (cve.getContext) {
		// ダウンロード ファイル名
		var now = new Date();
		var year = now.getYear();
		var month = now.getMonth() + 1;
		var day = now.getDate();
		var hour = now.getHours();
		var min = now.getMinutes();
		var sec = now.getSeconds();

		var filename = 'download_' + year + month + day + hour + min + sec + '.png';

		var ctx = cve.getContext('2d');
		var base64;
		try {
			base64 = cve.toDataURL();
		}catch(e) {
			alert("ロゴが外部URLをしているため、ダウンロードボタンを使用できません。")
			return;
		}
		document.getElementById("newImg").src = base64;

		var blob = Base64toBlob(base64);
		const url = window.URL.createObjectURL(blob);
		document.getElementById("dlImg").href = url;
		document.getElementById("dlImg").download = filename;

		$('#alert').text("ブラウザ判定");
		//  ダウンロード開始
		if (window.navigator.msSaveBlob) {
			// IE
			window.navigator.msSaveBlob(Base64toBlob(base64), filename);
		} else {
			// Chrome, Firefox, Edge
			document.getElementById("dlImg").click();
		}
		window.URL.revokeObjectURL(url);
	}
}

function Base64toBlob(base64)
{
	var tmp = base64.split(',');
	var data = atob(tmp[1]);
	var mime = tmp[0].split(':')[1].split(';')[0];
	var buf = new Uint8Array(data.length);
	for (var i = 0; i < data.length; i++) {
		buf[i] = data.charCodeAt(i);
	}
	var blob = new Blob([buf], { type: mime });
	return blob;
}

function NewWindow(){
	
	var cve = document.getElementById("result");
	if (cve.getContext) {
		var dataUrl;
		try {
			dataUrl = cve.toDataURL();
		}catch(e) {
			alert("ロゴが外部URLをしているため、ダウンロードボタンを使用できません。")
			return;
		}
		var w = window.open('about:blank');
		w.document.write("<img src='" + dataUrl + "'/>");
	} else {
	}
}