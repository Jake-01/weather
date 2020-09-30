import serial
import sqlite3
import time
from datetime import datetime


now = datetime.now()

current_time = now.strftime("%H:%M")
print("Current Time =", current_time)
log_timer = datetime.now().minute
log_name = now.strftime("%d-%m-%Y-%H%M")
print(log_name)
log_name = r"C:\Users\Jake\Documents\weather\logs\ " + log_name + ".txt"
log = open(log_name, "x")
log.close()

conn = sqlite3.connect('weather.db', check_same_thread=False)
c = conn.cursor()


temp = 0#temp in C to nearest 0.1
RH = 0#the RH to nearest 0.1%
WD = 0 #Wind direction - True
WS = 0 #wind speed in meters per second
WSA = []
# Create table
# c.execute('''CREATE TABLE variables
#              (Temp Real,
#              RH Real,
#              WD Real,
#              WS Real,
#              Lat Text,
#              Long Text,
#              HighestWS Real,
#              AverageWS Real,
#              StartTime Text
#              )''')
#
# # Insert a row of data
# c.execute("INSERT INTO variables VALUES (0, 0, 0, 0 , 0, 0, 0, 0, '')")
# conn.commit()

c.execute('SELECT * FROM variables', )
print(c.fetchone())

ser = serial.Serial(
    port='COM4',
    baudrate=4800,)

ser.flushInput()

def update_weather(temp, RH, WD, WS):
    with conn:
        c.execute("""UPDATE variables SET
                    temp = :temp,
                    RH = :RH,
                    WD = :WD,
                    WS = :WS
                    """,
                    {'temp': temp, 'RH': RH, 'WD': WD, 'WS': WS})
        conn.commit()

def update_gps(Lat, Long):
    with conn:
        c.execute("""UPDATE variables SET
                    Lat = :Lat,
                    Long = :Long
                    """,
                    {'Lat': Lat, 'Long': Long})
        conn.commit()

def check_func(x):
    if len(x) == 0:
        return '0'
    else:
        return x

def timer(log_timer):
    if log_timer >= 45:
        log_timer = log_timer + 15 - 60
    else:
        log_timer = log_timer + 15

def latConvertor(x):
    dec = x[3:]
    print('dec: ' + dec)
    dec = round(dec/60, 6)
    lat = '-' + x[:2] + '.' + dec[2:]
    print('lat: ' + lat)
    return lat

def longConvertor(x):
    dec = x[4:]
    print('dec: ' + dec)
    dec = round(dec/60, 6)
    long = '-' + x[:3] + '.' + dec[2:]
    print('long: ' + long)
    return long

while True:
    try:
        read = ser.readline()
        # print(read)
        x = str(read)
        x = x.split(',')
        if '$WIMDA' in x[0] :
            temp = check_func(x[5])#temp in C to nearest 0.1
            RH = check_func(x[9])#the RH to nearest 0.1%
            WD = check_func(x[13]) #Wind direction - True
            WS = check_func(x[19]) #wind speed in meters per second
            update_weather(temp, RH, WD, WS)
            print("temp: " + temp)
            print("RH: " + RH)
            print("Wind direction: " + WD)
            print("Wind speed: " + WS)
            c.execute('SELECT * FROM variables', )
            WSA.append(float(WS))
            if log_timer == datetime.now().minute:
                now = datetime.now()
                time = now.strftime("%d/%m/%Y-%H:%M")
                average = sum(WSA)/len(WSA)
                record = "Time: "+ time + " Temp: " + str(temp) + "C RH: " + str(RH) + "% Wind Direction: " + str(WD) + " Windspeed: " + str(round(average*3.6,1)) +"Km/Hr" +'\n'
                log_timer = datetime.now().minute + 1
                WSA = []
                print(record)
                log = open(log_name, "a")
                # log.write()
                log.write(record)
                log.close()
        elif '$GPGGA' in x[0]:
            print(read)
            if x[6] == '0':
                print('GPS fix unavaible')
            else:
                lat = float(x[2])
                long = float(x[4])
                lat = latConvertor(lat)
                long = longConvertor(long)
                update_gps(lat, long)
                print('lat: ' + lat)
                print('long: ' + long)
                c.execute('SELECT * FROM variables', )
                print(c.fetchone())
        else:
            pass
    except:
        conn.commit()
        conn.close()
        print("Keyboard Interrupt")
        break
