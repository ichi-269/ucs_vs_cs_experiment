let file = '../static/material1.json';

let user_id = null; 
let allowPageLeave = false; // ページ離脱を許可するフラグ

window.onbeforeunload = function(e) {
    if (!allowPageLeave) {
        e.returnValue = "行った変更が保存されない可能性があります。ページを離れてもよろしいですか？";
    }
};
window.onload = function() {
    // user_id の取得と設定
    var user_id = getUserID();
}

preventBrowserBack();

function get_value_fin() {
    get_value();
    export_results();
}
function get_value() {
    let selectedOptions = [];
    document.querySelectorAll('input[name="sports"]:checked').forEach(function(checkbox) {
        selectedOptions.push(checkbox.value);
    });

    // result を空か否かで設定
    result = selectedOptions.length > 0;
    console.log("チェックボックスが選択されているか:", result); // デバッグ用
}


function export_results() {
    if (!user_id) {
        alert("ユーザーIDが取得できません。");
        return;
    }

    let data = {
        user_id: user_id,
        result: result // 回答がなければfalse
    };
    var user_data = [];
    user_data.push(data);

    console.log("送信データ:", user_data); // デバッグ用

    $.ajax({
        type: 'POST',
        url: '/send_imc',
        async: false,
        data: {
            'user_data': JSON.stringify(user_data),
            'file_name_suffix': 'exp2'
        },
        timeout: 50000
    }).done(function (response) {
        console.log("送信成功:", response);
        allowPageLeave = true; // ページ遷移を許可
        location.href = `../end?id=${user_id}`;
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error("送信失敗:", textStatus, errorThrown);
        alert("回答送信中にエラーが発生しました。もう一度終了ボタンを押してください。");
        document.getElementById('finish_all_scenarios').removeAttribute("disabled");
    });
}



// ブラウザバックを禁止する関数
function preventBrowserBack() {
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', (e) => {
        history.go(1);
    });
}


// クエリパラメータから user_id を取得し変数に代入
function getUserID() {
    const urlParams = new URLSearchParams(window.location.search);
    user_id = urlParams.get('id'); // クエリパラメータ 'id' から user_id を取得
    return user_id;
}