
from enum import Enum
class State(Enum):
    NOTHING = 0
    EXTERNAL = 1
    STOPPED = 2
    PLAYING = 3


import notify
import subprocess
import time

import keys



def gen_scenes(load_key, stage, pre_cmd=None):
    char_select = {
        "state": State.STOPPED,
        "pre_cmd": "xdotool keydown %s; sleep 0.2; xdotool keyup %s" % (load_key, load_key) + ";timeout 10 qiv -i -f -t ready.png || true",
        "name": "charselect: " + stage,
        "stage": stage
    }

    if pre_cmd:
        char_select["pre_cmd"] += ";sleep 0.5;" + pre_cmd

    return char_select

    # play = {
    #     "state": State.PLAYING,
    #     "pre_cmd": "", # Press start (enter)
    #     "name": stage
    # }

    # return [char_select, play]


SCENES = [
    # Pre-Concert screen


    # Play intro
    {
        "name": "intro",
        "state": State.EXTERNAL,
        "pre_cmd": "amixer set Master mute; xdotool keydown F8; sleep 0.2; xdotool keyup F8",
        "post_cmd": "(sleep 2; amixer set Master unmute)&"
    },

    # Game
    gen_scenes("F2", "Corneria"),
    gen_scenes("F7", "Onett"),
    gen_scenes("F2", "Great Bay"),
    gen_scenes("F4", "Mushroom Kingdom"),
    gen_scenes("F2", "Brinstar"),
    gen_scenes("F3", "Pokemon Stadium"),
    gen_scenes("F5", "Final Destination", pre_cmd="timeout 5 qiv -i -f -t fd.jpg || true"),
    gen_scenes("F6", "Hyrule Temple"),




    # *gen_scene("F3", "Fountain of Dreams"),
    #
    # *gen_scene("F4", "Fountain of Dreams"),
    #
    # *gen_scene("F5", "Fountain of Dreams"),
    #
    # *gen_scene("F6", "Fountain of Dreams"),
    #
    # *gen_scene("F7", "Fountain of Dreams"),
    #
    # *gen_scene("F8", "Fountain of Dreams"),






]

class StateManager():
    MAX_STATE_INDEX = len(SCENES)

    def __init__(self, pm):
        self.state = State.NOTHING
        self.state_index = -1
        self.pm = pm

    def set_state(self, st):
        self.state = st

    def next(self, state_num=None):

        # First, disable player inputs, and reset keys
        self.pm.set_enabled(False)
        keys.reset_keys()

        notify.send("Next state!")

        time.sleep(2)

        prev_scene = None
        if 0 <= self.state_index < len(SCENES):
            prev_scene = SCENES[self.state_index]


        if state_num == None:
            self.state_index += 1
        else:
            # For debug, switch to specific state
            self.state_index = state_num


        if self.state_index >= len(SCENES):
            print("Reached end of states. Exiting")
            return


        # Run post_cmd of previous scene if exists
        if prev_scene and "post_cmd" in prev_scene:
            output = subprocess.check_output(prev_scene["post_cmd"], shell=True)


        scene = SCENES[self.state_index]


        ### RUN SCENE ###

        print("Running scene: %s" % scene["name"])

        # set state
        self.set_state(scene["state"])

        # 1) pre_cmd
        if "pre_cmd" in scene:
            output = subprocess.check_output(scene["pre_cmd"], shell=True)

        time.sleep(2)


        # 2) main (hack)
        if "name" in scene and "charselect" in scene["name"] and "stage" in scene:
            self.pm.next()
            self._char_stage_select(scene["stage"])


    def _char_stage_select(self, stage):

        # 1) Choose characters
        for username, player_num in self.pm.get_current_players().items():
            character = self.pm.userinfo[username]["character"]

            # HACK for FD Fox only
            if stage == "Final Destination":
                keys.choose_character("Fox", player_num)
            else:
                keys.choose_character(character, player_num)



        # 2) Choose names

        for username, player_num in self.pm.get_current_players().items():
            keys.select_name(username, player_num)

        time.sleep(3)
        keys.hold_cmd("Return")


        # 3) Select Stage

        time.sleep(3)
        keys.select_stage(stage)
