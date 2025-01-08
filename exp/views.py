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
    # 確率でリダイレクトする
    if random.random() < 0.3333:
        return redirect('/top2')
    elif random.random() < 0.6666:
        return redirect('/top3')
    return redirect('/top1')

@app.route('/top1')
def top1():
    return render_template('exp/top1.html')
@app.route('/top1_2')
def top1_2():
    return render_template('exp/top1_2.html')

@app.route('/top2')
def top2():
    return render_template('exp/top2.html')
@app.route('/top2_2')
def top2_2():
    return render_template('exp/top2_2.html')

@app.route('/top3')
def top3():
    return render_template('exp/top3.html')
@app.route('/top3_2')
def top3_2():
    return render_template('exp/top3_2.html')

@app.route('/examine1')
def examine1():
    return render_template('exp/examine1.html')

@app.route('/examine2')
def examine2():
    return render_template('exp/examine2.html')

@app.route('/examine3')
def examine3():
    return render_template('exp/examine3.html')

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