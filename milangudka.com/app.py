from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route("/")
@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/portfolio")
def portfolio():
    return render_template("portfolio.html")

@app.route("/cv")
def cv():
    return render_template("cv.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/submit", methods=["POST"])
def submit():
    return render_template("submit.html")

@app.route("/hackathon")
def hackathon():
    return render_template("hackathon.html")

@app.route("/portfolioSite")
def portfolioSite():
    return render_template("portfolioSite.html")

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

if __name__ == "__main__":
    app.run(debug=True)