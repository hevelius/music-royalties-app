from flask import Flask, request, Response
from flask_cors import CORS, cross_origin
import ipfsApi
import fingerprint
import json
import os

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/uploader', methods=['POST'])
@cross_origin()
def upload_file():
   if request.method == 'POST':
      print(request.form)
      cover = request.files['cover']
      cover.save(cover.filename)
      audio = request.files['audio']
      audio.save(audio.filename)
      fingerprint_results = fingerprint.fingerprint_file(audio.filename)
      hashes = open("hashes.json", "w")
      hashes.write(json.dumps(fingerprint_results))
      #hashes.close()
      results = {}
      print(request.form.get("data"))
      formData = json.loads(request.form.get("data"))
      print(formData.get('name'))
      results["name"] = formData.get('name')
      results["description"] = formData.get('description')
      try:
        api = ipfsApi.Client('127.0.0.1', 5001)
        res = api.add(cover.filename)
        print(res)
        results["cover"] = res["Hash"]
        res = api.add("hashes.json")
        print(res)
        results["fingerprint"] = res["Hash"]
        f = open("results.json", "w")
        f.write(json.dumps(results))
        f.close()
        resposeHash = api.add("results.json")
        print(resposeHash)
      except ipfsApi.exceptions.ConnectionError as ce:
        print(str(ce))
      finally:
        os.remove(cover.filename)
        os.remove(audio.filename)
        os.remove("hashes.json")
        os.remove("results.json")
        print('Done')
      
      return Response(json.dumps(resposeHash["Hash"]), mimetype='application/json')

# main driver function
if __name__ == '__main__':
    # run() method of Flask class runs the application
    # on the local development server.
    app.run()