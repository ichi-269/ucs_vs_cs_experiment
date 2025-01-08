let file = '../static/material3.json';
var user_data = [];
var test_order = [];
var current_sample_selection = [];
var estimations = [];
// let scenarios = shuffle(['one','two','three']);
// let stimuli = shuffle(['stimuli_test','1','2']);
let scenarios = shuffle(['one','two','three','four','five','six','seven','eight']);
let stimuli = shuffle(['1','2','3','4','5','6','7','8']);
let bgcolors = shuffle(['#f0ffff','#f0fff0','#f5f5dc','#e0ffff','#fffaf0','#f8f8ff','#fffafa','#f5f5f5','#f0f8ff','#ffe4e1','#d8bfd8']);
let image_type = ["p", "notp", "q", "notq"];
let img_combination = {
    'a': {'cause': 'p', 'effect': 'q'},
    'b': {'cause': 'p', 'effect': 'notq'},
    'm': {'cause': 'midp', 'effect': 'q'},
    'n': {'cause': 'midp', 'effect': 'notq'},
    'c': {'cause': 'notp', 'effect': 'q'},
    'd': {'cause': 'notp', 'effect': 'notq'}
}
var current_test_page = 0; // 何事例目か
var sample_size = 0; // 現在の設問の事例の総数
var user_id = 0;
var start_time = getNow();
var sce_idx = 0;  // 動物の判別
var est_i = 0;
var cell_size = 0;

// read_json(): jsonファイルを読み込む
// getImages(): 画像のプリロード
// to_next_scenario_description(): シナリオの表示
window.onload = function() {
    // ランダム数列の発行
    user_id = Math.round(Math.random() * 100000000);
    user_id = zeroPadding(user_id, 8);
    test_order = read_json(file);
    estimations = new Array();
    getImages();
    to_next_scenario_description(is_first_time=true);
}

window.onbeforeunload = function(e) {
    e.returnValue = "ページを離れると、これまで入力した内容は全て破棄されます。ページを離れてもよろしいですか？";
}

function read_json(filename) {
    var json = $.ajax({
        type: 'GET',
        url: filename,
        async: false,
        dataType: 'json'
    }).responseText;
    return JSON.parse(json);
}
function getImages() {
    for (scenario in scenarios){
        for(type in image_type){
            var img = document.createElement('img');
            img.src = `../${test_order[scenarios[scenario]]['images'][image_type[type]]}`;
        }
    }
    document.getElementById('preload_image').style.display = "none";
}

preventBrowserBack();

function clear_page() {
    document.getElementById('estimate_input_area').style.display = "none";
    document.getElementById('check_sentence').style.display = "none";
    document.getElementById('description_area').style.display = "none";
    document.getElementById('show_sample_area').style.display = 'none';
}

// シナリオの表示
function to_next_scenario_description(is_first_time=false) {
    clear_page();
    if (!is_first_time){
        sce_idx++;
    }
    resetBackGround();
    document.getElementById('page').innerHTML = "<h4>"+ (sce_idx+1) + '/' + scenarios.length +"種類目</h4>";
    document.getElementById('scenario_title').innerHTML = "<h2>" + test_order[scenarios[sce_idx]]['title'] + "</h2>";
    document.getElementById('check_sentence').style.display = "inline-block";
    document.getElementById('description_area').style.display = "inline-block";
    document.getElementById('start_scenario_button').setAttribute("disabled",true);
    let desc_len = test_order[scenarios[sce_idx]]['descriptions'].length;
    for (let i = 0; i < desc_len; i++) {
        document.getElementById('scenario_description'+String(i+1)).innerHTML = test_order[scenarios[sce_idx]]['descriptions'][i];
    }
}

// チェックが入っているか確認する
function check_description() {
    let checkbox = document.getElementsByClassName("checkbox");
    let count = 0;
    for (let i = 0 ; i < checkbox.length ; i++) {
        if (checkbox[i].checked) count++;
    }
    if (count == checkbox.length) {
        document.getElementById('start_scenario_button').removeAttribute("disabled");
    } else {
        document.getElementById("start_scenario_button").setAttribute("disabled", true);
    }
}

// 事例を表示する画面へ遷移
function to_next_new_sample_page() {
    clear_page();
    let list = document.getElementsByClassName("checkbox");
    for (let index = 0; index < list.length; ++index) {
        list[index].checked = false;
    }
    current_test_page = 0;
    document.getElementById('show_sample_area').style.display = "inline";
    document.getElementById('order').innerHTML = "実験の進捗状況";
    changeBackGround();

    // 提示するサンプルのリストを作り、サンプルサイズを求める。
    current_sample_selection = [];
    sample_size = 0;
    Object.keys(test_order[scenarios[sce_idx]]['samples'][stimuli[sce_idx]]).forEach(function(elm) {
        if (test_order[scenarios[sce_idx]]['samples'][stimuli[sce_idx]][elm] > 0) {
            sample_size += test_order[scenarios[sce_idx]]['samples'][stimuli[sce_idx]][elm];
            cell_size = test_order[scenarios[sce_idx]]['samples'][stimuli[sce_idx]][elm];
            for (let i = 0 ; i < cell_size ; i++) {
                current_sample_selection.push(elm);
            }
        }
    });
    current_sample_selection = shuffle(current_sample_selection);

    to_next_sample();
}

// 次の事例があるか確認し、存在しない場合は推定画面へ遷移
function to_next_sample() {
    const button1 = document.getElementById('next_sample');
    button1.disabled = true;
    if (current_test_page >= sample_size) {
        alert('観察結果は以上になります。');
        draw_estimate('fin');
        return;
    }
    showStimulation();
    setTimeout(function(){
        button1.disabled = false;
    },500);
}

function showStimulation() {
    var sample = current_sample_selection[current_test_page];
    var desc = test_order[scenarios[sce_idx]]['sentences'][sample];
    console.log("showStimulation_in");
    desc = desc.split('、');
    document.getElementById('first_sentence').innerHTML = "<h4>" + desc[0] + "</h4>";
    document.getElementById('last_sentence').innerHTML = "<h4>" + desc[1] + "</h4>";
    document.getElementById('show_sample_area').style.display = "inline";
    document.getElementById('first_sentence').style.display = 'inline-block';
    document.getElementById('last_sentence').style.display = 'inline-block';
    document.getElementById('sample_before').style.display = 'inline';
    document.getElementById('estimate_input_area').style.display = 'none';
    document.getElementById('next_sample').style.display = 'inline';
    document.getElementById('sample_before').src = `../${test_order[scenarios[sce_idx]]['images'][img_combination[sample]['cause']]}`;
    document.getElementById('arrow').src = `../${test_order[scenarios[sce_idx]]['images']['arrow']}`;
    document.getElementById('sample_after').src = `../${test_order[scenarios[sce_idx]]['images'][img_combination[sample]['effect']]}`;
    // 進捗バー更新
    progress_bar();
    current_test_page++;
    document.getElementById('current_page').innerHTML = current_test_page+'/'+sample_size;

    // show_back_sample();
    // console.log("showStimulation_out");
}

// 進捗バーを更新する関数
function progress_bar(){
    document.getElementById('progress_bar').value = current_test_page;
    document.getElementById('progress_bar').max = sample_size-1;
}

function draw_estimate(c) {
    clear_page();
    document.getElementById("checkbox").setAttribute("disabled",true);
    document.getElementById('next_scenario').style.display = 'none';
    document.getElementById('estimate_input_area').style.display = 'inline-block';
    document.getElementById('next_scenario').setAttribute("disabled", true);
    document.getElementById('continue_scenario').setAttribute("disabled", true);
    document.getElementById('continue_scenario').style.display = 'inline';
    document.getElementById('finish_all_scenarios').setAttribute("disabled",true);
    document.getElementById('estimate_slider').value = 50;
    document.getElementById('estimate').innerHTML = 50;
    document.getElementById("checkbox").checked = false;
    if (c=='fin'){
        document.getElementById('continue_scenario').style.display = 'none';
        if (sce_idx == scenarios.length - 1){
            document.getElementById('finish_all_scenarios').style.display = 'inline';
        } else {
            document.getElementById('next_scenario').style.display = 'inline';
        }
    }

    document.getElementById('estimate_description').innerHTML = 
        '<h3>' + test_order[scenarios[sce_idx]]['result'] + 'と思いますか？</h3>' + 
        '<ul>0：' + test_order[scenarios[sce_idx]]['min_result'] + '</ul>' + 
        '<ul>100：' + test_order[scenarios[sce_idx]]['max_result'] + '</ul>' +
        '<ul>として、0から100の値で<b>直感的に</b>回答してください。</ul>' +
        '<p>※スライダーの挙動に不具合が生じた場合、スライダーを直接クリックして値を選択してください。</p>'
}


// 因果関係の強さの推定値を取得する
function get_value() {
    append_estimation(
        estimation=document.getElementById('estimate_slider').value
    );
}

function get_value_fin() {
    // 回答送信ボタンの連打防止
    document.getElementById('finish_all_scenarios').disabled = true;
    get_value();
    export_results();
}

// 推定画面のチェックが入ってるか確認する
function check_estimate() {
    if (document.getElementById('checkbox').checked) {
        document.getElementById('next_scenario').removeAttribute("disabled");
        document.getElementById('continue_scenario').removeAttribute("disabled");
        document.getElementById('finish_all_scenarios').removeAttribute("disabled");
    } else {
        document.getElementById("checkbox").removeAttribute("disabled");
        document.getElementById("finish_all_scenarios").setAttribute("disabled", true);
    }
}

// ###############
// ## functions ##
// ###############

function  append_estimation(estimation) {
    let data = {};
    data['user_id'] = user_id;
    data['number'] = scenarios[sce_idx];
    data['stimuli'] = stimuli[sce_idx];
    data['estimation'] = estimation;
    estimations.push(data);
}

function export_results() {
    let data = {};
    data['user_id'] = user_id;
    data['start_time'] = start_time;
    data['end_time'] = getNow();
    data['user_agent'] = window.navigator.userAgent;
    user_data.push(data);

    $.ajax({
        type: 'POST',
        url: '/send',
        async: false,
        data: {
            'user_data': JSON.stringify(user_data),
            'estimations': JSON.stringify(estimations),
            'file_name_suffix': 'exp3'
        },
        timeout: 50000
    }).done(function (response) {
        location.href = `../end?id=${user_id}`;
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert("回答送信中にエラーが発生しました。もう一度終了ボタンを押してください。");
        document.getElementById('finish_all_scenarios').removeAttribute("disabled");
        throw 'Server Error';
    });
}

// 配列内の要素をシャッフルする
// 引用元(https://www.nxworld.net/js-array-shuffle.html)
function shuffle ([...array]) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 0埋め、ランダム数列の桁数を揃えるため使用している
// 引用元(https://rfs.jp/sb/javascript/js-lab/zeropadding.html)
function zeroPadding(NUM, LEN){
	return ( Array(LEN).join('0') + NUM ).slice( -LEN );
}

// 現在時刻を返す関数
// 引用元(http://www.shurey.com/js/samples/2_msg10.html)
function getNow() {
	var now = new Date();
	var year = now.getFullYear();
	var mon = now.getMonth()+1;  // １を足すこと
	var day = now.getDate();
	var hour = now.getHours();
	var min = now.getMinutes();
	var sec = now.getSeconds();
	var s = year + "/" + mon + "/" + day + " " + hour + ":" + min + ":" + sec; 
	return s;
}

// ブラウザバックを禁止する関数
function preventBrowserBack() {
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', (e) => {
        history.go(1);
    });
}

// backgroundColorを変更する関数
function changeBackGround(){
	document.body.style.backgroundColor = bgcolors[sce_idx];
}

// backgroundColorをリセットする関数
function resetBackGround(){
    document.body.style.backgroundColor = 'Transparent';
}