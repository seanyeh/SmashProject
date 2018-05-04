#!/usr/bin/env python3

import time
from threading import Thread

import keys
from playermanager import PlayerManager
import states
from states import StateManager

import socketio
import eventlet
from flask import Flask, render_template

import subprocess


'''
Globals
'''



sio = socketio.Server()
app = Flask(__name__)


PM = PlayerManager(sio)
SM = StateManager(PM)

@sio.on('connect')
def connect(sid, environ):
    print("connect ", sid)

@sio.on('disconnect')
def disconnect(sid):
    PM.remove(sid)


@sio.on("reconnect")
def reconnect(sid):
    print("Reconnecting:", sid)



'''
Login
'''

@sio.on("login")
def login(sid, data):
    print("received login")
    print(data)
    if "username" in data and "secret" in data and "character" in data:
        print("login received:" + str(data))
        PM.user_login(sid, data["username"], data["character"], data["secret"])



'''
Buttons
'''
@sio.on("bpress")
def bpress(sid, key):
    PM.press_key(sid, str(key), True)


@sio.on("brelease")
def brelease(sid, key):
    PM.press_key(sid, str(key), False)



'''
Survey
'''
@sio.on("survey")
def survey(sid, data):
    print("Got survey:", data)
    with open("surveys/" + str(sid) + ".txt", "w") as f:
        f.write(str(data) + "\n")


'''
ADMIN
'''

@sio.on("admin_pause")
def pause(sid):
    PM.set_enabled(False)

@sio.on("admin_resume")
def resume(sid):
    PM.set_enabled(True)

@sio.on("admin_get_info")
def get_players(sid):
    data = {
        "players": PM.players,
        "queue": PM.queue,
        "userinfo": PM.userinfo
    }
    sio.emit("admin_get_info", data, room=sid)


######################################
# Admin button presses

@sio.on("admin_bpress")
def admin_bpress(sid, opts):
    print("admin bpress")
    if "player_num" in opts and "key" in opts:
        PM.press_key(opts["player_num"], str(opts["key"]), True, admin_override=True)


@sio.on("admin_brelease")
def admin_brelease(sid, opts):
    print("admin brelease")
    if "player_num" in opts and "key" in opts:
        PM.press_key(opts["player_num"], str(opts["key"]), False, admin_override=True)

######################################

def next_state():
    print("inside thread: next_state")
    SM.next()

def set_state(state_num):
    print("set_state")
    SM.next(state_num)

@sio.on("admin_nextstate")
def admin_nextstate(sid):
    bg = Thread(target=next_state, args=())
    print("Starting next state thread")
    bg.start()
    print("lets see if it works")


@sio.on("admin_setstate")
def admin_nextstate(sid, state_num):
    try:
        i = int(state_num)
        bg = Thread(target=set_state, args=(i,))
        bg.start()
    except:
        print("setstate received a non-int!!")


@sio.on("admin_getstates")
def admin_getstates(sid):
    sio.emit("admin_getstates", [x["name"] for x in states.SCENES], room=sid)


# Press Enter (Return/Start)
@sio.on("admin_enter")
def admin_enter(sid):
    print("admin_enter")
    keys.hold_cmd("Return")

@sio.on("admin_enable_inputs")
def admin_enable_inputs(sid):
    print("enabling inputs")
    PM.set_enabled(True)

@sio.on("admin_start_survey")
def admin_start_survey(sid):
    sio.emit("survey", broadcast=True)


# VERY UNSAFE. For debug only!
@sio.on("admin_eval")
def admin_eval(sid, cmd):
    output = str(eval(cmd))

    sio.emit("admin_eval", output, room=sid)

    print("ADMIN_EVAL:", output)



if __name__ == '__main__':
    # wrap Flask application with socketio's middleware
    app = socketio.Middleware(sio, app)

    # deploy as an eventlet WSGI server
    eventlet.wsgi.server(eventlet.listen(('', 8080)), app)
