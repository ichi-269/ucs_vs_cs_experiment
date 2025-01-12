import json
import os
import csv
import random
from flask import render_template
from flask import render_template, request
from exp import app
from flask import Flask, request, Response, redirect
from threading import Lock

@app.route('/')
def index():
    return redirect('/top1')

@app.route('/top1')
def top1():
    return render_template('exp/top1.html')
@app.route('/top1_2')
def top1_2():
    return render_template('exp/top1_2.html')

@app.route('/examine1')
def examine1():
    return render_template('exp/examine1.html')

@app.route('/examine2')
def examine2():
    return render_template('exp/examine2.html')

@app.route('/end')
def end():
    return render_template('exp/end.html')

@app.route('/end', methods=['GET'])
def end_form():
    return render_template('exp/end.html')

@app.route('/send', methods=['POST'])
def send():
    try:
        raw_data = request.form.to_dict()
        suffix = raw_data["file_name_suffix"]
        for data_name in ["user_data", "estimations"]:
            data = json.loads(raw_data[data_name])
            file_name = data_name + "_" + suffix
            filepath = os.path.join('.', 'res_' + file_name + '.csv')

            # res.csvが存在しないとき，作成し，ヘッダーを書き込む
            if not os.path.exists(filepath):
                with open(filepath, 'w', newline='') as f:
                    writer = csv.DictWriter(f, data[0].keys())
                    writer.writeheader()

            with open(filepath, 'a', newline='') as f:
                writer = csv.DictWriter(f, data[0].keys())
                writer.writerows(data)

        return Response(status=200)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(status=500)
    
@app.route('/send_imc', methods=['POST'])
def send_imc():
    try:
        # リクエストデータを辞書形式に変換
        raw_data = request.form.to_dict()
        suffix = raw_data.get("file_name_suffix", "default")  # サフィックスがない場合のデフォルト値

        # 必要なデータセット（user_data のみ）
        if "user_data" in raw_data:
            user_data = json.loads(raw_data["user_data"])  # JSONデコード
            file_name = "user_data_" + suffix + ".csv"  # ファイル名を生成
            filepath = os.path.join('.', file_name)

            # ファイルが存在しない場合はヘッダーを追加
            if not os.path.exists(filepath):
                with open(filepath, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.DictWriter(f, user_data[0].keys())
                    writer.writeheader()

            # データを追記
            with open(filepath, 'a', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, user_data[0].keys())
                writer.writerows(user_data)

        return Response(status=200)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(status=500)