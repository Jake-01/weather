import sqlite3
from flask import Flask, request
from flask_cors import cross_origin
import json
from datetime import datetime

now = datetime.now()

current_time = now.strftime("%H:%M")
print("Current Time =", current_time)

conn = sqlite3.connect('weather.db', check_same_thread=False)

c = conn.cursor()

HighestWS = 0
AverageHolder = []

# c.execute("""CREATE TABLE variables (
#     Temp Real,
#     RH Text,
#     WD Text,
#     WS Real,
#     Lat Text,
#     Long Text,
#     HighestWS Real,
#     AverageWS Real,
#     StartTime Text
#     )""")
#
# c.execute("INSERT INTO variables VALUES (20.7, '50.0', '180', 2.0, '-45.8668', '170.4911', 0, 0, '')")
# conn.commit()

c.execute("UPDATE variables SET StartTime = :StartTime", {'StartTime': current_time})
conn.commit()

c.execute("SELECT * FROM variables")
print(c.fetchone())

app = Flask(__name__)

@app.route("/get_data/", methods=['GET'])
@cross_origin()
def get_data():
    global HighestWS
    global AverageHolder
    c.execute("SELECT * FROM variables")
    variables = c.fetchone()
    ws = variables[3]
    if ws > HighestWS:
        HighestWS = ws
        c.execute("UPDATE variables SET HighestWS = :HighestWS", {'HighestWS': ws})
        conn.commit()
        print('Highest WS updated')
    AverageHolder.append(variables[3])
    average = sum(AverageHolder)/len(AverageHolder)
    print(sum(AverageHolder))
    print(len(AverageHolder))
    print(sum(AverageHolder)/len(AverageHolder))
    c.execute("UPDATE variables SET averageWS = :averageWS", {'averageWS': average})
    print(c.fetchall())
    c.execute("SELECT * FROM variables")
    data = c.fetchall()
    data = json.dumps(data)
    conn.commit()
    return (data)

@app.route("/reset_average/", methods=['GET'])
@cross_origin()
def reset_average():
    global AverageHolder
    AverageHolder = []
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    c.execute("UPDATE variables SET StartTime = :StartTime", {'StartTime': current_time})
    conn.commit()
    c.execute("SELECT * FROM variables")
    print(c.fetchone())
    print('average reset')
    return('average reset')


@app.route("/reset_highestWS/", methods=['GET'])
@cross_origin()
def reset_highestWS():
    global HighestWS
    HighestWS = 0
    print('HighestWS reset')
    return('Highest windspeed reset')



if __name__ == "__main__":
    app.run(host='192.168.10.50', port=4242)


conn.commit()
conn.close()
