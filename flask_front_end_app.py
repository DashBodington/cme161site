import os, copy
debug = False

from flask import Flask, jsonify, request, send_from_directory, url_for, redirect, make_response
from flask.ext.cors import CORS
app = Flask(__name__, static_url_path='')
CORS(app)

# get root
@app.route("/")
def index():
    return app.make_response(open('app/index.html').read())

# send assets
@app.route('/assets/<path:path>')
# @nocache
def send_assets(path):
    return send_from_directory('app/assets/', path)

if __name__ == "__main__":
	port = int(os.environ.get("PORT", 5050))
	app.run(host='0.0.0.0', port=port)



# prevent changes from being ignored due to caching, enable this and @nocache if you need to
# from flask.ext import assets
# from functools import update_wrapper
# def nocache(f):
# 	def new_func(*args, **kwargs):
# 		resp = make_response(f(*args, **kwargs))
# 		resp.cache_control.no_cache = True
# 		return resp
# 	return update_wrapper(new_func, f)
