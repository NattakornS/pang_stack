from __main__ import app

@app.route('/pred/test', methods=['GET'])
def test():
    return 'it works!'