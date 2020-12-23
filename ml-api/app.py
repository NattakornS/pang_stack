import json
import time
import os
from flask import Flask, request, jsonify
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS, cross_origin
from flask import send_file
import requests
from urllib.parse import unquote

# ----------------------------
from dotenv import load_dotenv
load_dotenv(dotenv_path='.env.{}'.format(os.getenv('ENV')))

app = Flask(__name__)
api = Api(app)
app.config['JSON_AS_ASCII'] = False
pdfpath = 'http://94.74.91.85:5555/storage/'

from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier

import joblib
import controller.prediction

@app.route('/')
@cross_origin()
def index():
    return "this api will return \n1. gov's doc or not \n2. image of blue box \n3. image of redbox \n4. speed"

@app.route('/doc', methods=['POST', 'GET'])
@cross_origin()
def returndata():

    # parser = reqparse.RequestParser()
    # # parser.add_argument('keyword', type=str)
    # filename = request.values['param']
    # req = pdfpath + filename
    # req = unquote(req)
    # url_pages = requests.get(req, stream=True)
    # result = {'gov_doc': None, 'blue_box': None, 'red_box': None, 'speed': None, 'origin_doc': None}
    # # dictp = parser.parse_args()
    # # kw = dictp['keyword']
    # ###
    # # im_red, im_blue = pred.findrect(pred.pdftoimage(url_pages))
    # ###

    # left, right = pred.findrect(pred.pdftoimage(url_pages))
    # im_blue, im_red = pred.croppingRectangleColours(left, right, unquote(filename))
    # result['red_box'] = im_red
    # result['origin_doc'] = filename
    # if im_blue is not None:
    #     result['gov_doc'] = True
    #     result['blue_box'] = im_blue

    # record('doc_type', 'เอกสารราชการ', filename)
    result = "result"
    return result

@app.route('/pred', methods=['POST'])
@cross_origin()
def predict():
    data = request.get_json()
    bst = joblib.load('/shared/model/lgb.pkl')
    xtest = [data]
    result = bst.predict(xtest)
    return json.dumps({
        'result': "{}".format(result[0])
    }, ensure_ascii=False).encode('utf8')

def record(attr_name, attr_value, doc_name):
    # doc_name = 'doc 001.pdf'
    headers = {'content-type': 'application/json'}
    url = 'http://{}:5000/documents/update_by_name/{}'.format(os.getenv('HOST_IP'), doc_name) #os.getenv('HOST_IP')"172.18.0.4"

    data = {
        "attr_name": attr_name, 
        "attr_value": attr_value, 
        "doc_name": doc_name
    }
    # params = {
    #     'id': ''
    #     'doc_no': ''
    #     'doc_type': ''
    #     'receive_number': ''
    #     'receive_year': ''
    #     'receive_date': ''
    #     'important_lv': ''
    #     'doc_date': ''
    #     'to_who': ''
    #     'topic': ''
    #     'from_who': ''
    #     'doc_action': ''
    #     'responsibility': ''
    #     'confidence': ''
    #     'status_doc': ''
    #     'status_date': ''
    # }

    # requests.post(url, params=params)
    requests.post(url, params=None, data=json.dumps(data), headers=headers)
    # requests.post(url, params=params, data=json.dumps(data), headers=headers)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
