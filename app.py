from flask import *

from api.api import Travel_Api 

#####################################################################
app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

#設定 session 的密鑰
app.secret_key = "so far so good"

app.register_blueprint(Travel_Api, url_prefix='/api')

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

app.run(host='0.0.0.0', port=3000, debug=True) 