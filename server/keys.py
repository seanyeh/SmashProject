import subprocess
import time

KEYS = {
    "A": ["z", "r", "u", "p"],
    "B": ["a", "f", "j", "semicolon"],
    "X": ["q", "v", "m", "slash"],
    "UP": ["2", "5", "8", "minus"],
    "DOWN": ["w", "t", "i", "bracketleft"],
    "LEFT": ["s", "g", "k", "apostrophe"],
    "RIGHT": ["x", "b", "comma", "Up"],
    "CUP": ["3", "6", "9", "BackSpace"],
    "CDOWN": ["e", "y", "o", "backslash"],
    "CLEFT": ["d", "h", "l", "equal"],
    "CRIGHT": ["c", "n", "period", "bracketright"],
    "DUP": ["1", "4", "7", "0"]
}

# (Row, column) from bottom up
CHARACTERS = {
    "Pichu":        (0, 1),
    "Pikachu":      (0, 2),
    "Jigglypuff":   (0, 3),
    "Mewtwo":       (0, 4),
    "Mr.Game & Watch":(0, 5),
    "Marth":        (0, 6),
    "Roy":          (0, 7),

    "Falco":        (1, 0),
    "Fox":          (1, 1),
    "Ness":         (1, 2),
    "Ice Climbers": (1, 3),
    "Kirby":        (1, 4),
    "Samus":        (1, 5),
    "Zelda":        (1, 6),
    "Link":         (1, 7),
    "Young Link":   (1, 8),

    "Dr. Mario":    (2, 0),
    "Mario":        (2, 1),
    "Luigi":        (2, 2),
    "Bowser":       (2, 3),
    "Peach":        (2, 4),
    "Yoshi":        (2, 5),
    "DK":           (2, 6),
    "C.Falcon":     (2, 7),
    "Ganondorf":    (2, 8),
}


CHARSELECT_ROW_DELAYS = [0.34, 0.43, 0.52]
CHARSELECT_COL_DELAYS = [0.04, 0.13, 0.22, 0.32, 0.41, 0.5, 0.59, 0.69, 0.79]

# For vanilla/20xx
# NAMESELECT_DELAYS = [
#         [0.1, 0.03],
#         [0.3, 0],
#         [0.5, -0.003],
#         [0.7, -0.02],
# ]

# For 20xxTE
NAMESELECT_DELAYS = [
        [0.1, 0.03],
        [0.3, 0.03],
        [0.5, 0.03],
        [0.7, 0.03],
]

STAGESELECT_DELAYS = {
        "Fountain of Dreams": [0.09, 0.3],
        "Mushroom Kingdom": [0.22, 0.16],
        "Great Bay": [-0.02, 0.3],
        "Onett": [0, 0.16],
        "Pokemon Stadium": [0.15, 0.16],
        "Brinstar": [-0.04, 0.16],
        "Final Destination": [0.05, 0.03],
        "Hyrule Temple": [-0.02, 0.23],
        "Corneria": [0.17, 0.3]
}

# Keep track of which keys are held down, easy to reset
# KEYS_DOWN = {}

def _get_letter_coords(letter):
    asc = ord(letter)
    if (65 <= asc <= 74):
        return (0, asc - 65)
    elif (75 <= asc <= 84):
        return (1, asc - 75)
    elif (85 <= asc <= 91):
        return (2, asc - 85)
    elif (48 <= asc <= 57):
        return (3, asc - 48)
    else:
        return None


def _get_key(keycode, player_id):
    if keycode in KEYS and player_id in range(len(KEYS[keycode])):
        return KEYS[keycode][player_id]
    return None


def press_cmd(keycode, player_id, keydown):
    key = _get_key(keycode, player_id)
    if not key:
        return

    keycmd = "keydown" if keydown else "keyup"

    cmd = "xdotool %s %s"
    output = subprocess.check_output(cmd % (keycmd, key), shell=True)

    # if key in KEYS_DOWN:
    #     del KEYS_DOWN[key]


def hold_cmd(keycode, player_id=None, delay=0.12):
    # If delay is 0, don't press any key
    if delay == 0:
        return

    # If player_id is None, press "raw" key
    if player_id == None:
        key = keycode
        print("Set raw keycode to key")
    else:
        key = _get_key(keycode, player_id)

    if not key:
        return
    print("Going to press key:", key)

    cmd = "xdotool keydown %s; sleep %f; xdotool keyup %s"
    output = subprocess.check_output( cmd % (key, delay, key), shell=True)

    # KEYS_DOWN[key] = True


# def reset():
#     for key in KEYS_DOWN:
#         output = subprocess.check_output("xdotool keyup %s" % key, shell=True)


def choose_character(character, player_id, debug_delay=0):
    if character not in CHARACTERS:
        return

    time.sleep(debug_delay)

    hold_cmd("LEFT", player_id, 1.2)
    hold_cmd("DOWN", player_id, 0.7)

    row, col = CHARACTERS[character]

    hold_cmd("UP", player_id, CHARSELECT_ROW_DELAYS[row])
    hold_cmd("RIGHT", player_id, CHARSELECT_COL_DELAYS[col])

    hold_cmd("B", player_id)
    hold_cmd("A", player_id)


def select_name(name, player_id, debug_delay=0):
    print("select_name")
    time.sleep(debug_delay)

    delays = NAMESELECT_DELAYS[player_id]

    # Reset position
    hold_cmd("LEFT", player_id, 1.2)
    hold_cmd("DOWN", player_id, 0.7)

    # Hover over name
    hold_cmd("UP", player_id, 0.035)
    hold_cmd("RIGHT", player_id, delays[0])

    hold_cmd("A", player_id)

    time.sleep(0.8)

    # Hover over name entry
    key = "UP"
    d = delays[1]
    if d < 0:
        d = abs(d)
        key = "DOWN"

    hold_cmd(key, player_id, d)

    hold_cmd("A", player_id)

    time.sleep(0.8)

    # Type name
    _type_name(name, player_id)



def _type_name(name, player_id, debug_delay=0):
    if len(name) == 0:
        return

    time.sleep(debug_delay)

    coords = (0, 0)
    for c in name:
        next_coords = _get_letter_coords(c)
        rdiff, cdiff = (next_coords[0] - coords[0], next_coords[1] - coords[1])

        ckey = "RIGHT" if cdiff > 0 else "LEFT"
        rkey = "DOWN" if rdiff > 0 else "UP"

        for _ in range(abs(rdiff)):
            hold_cmd(rkey, player_id)

        for _ in range(abs(cdiff)):
            hold_cmd(ckey, player_id)

        hold_cmd("A", player_id)

        coords = next_coords

    time.sleep(0.5)

    # If length of name is not max, need to press Enter one extra time
    if len(name) < 8:
        hold_cmd("Return")
        time.sleep(0.5)

    hold_cmd("Return")


def select_stage(stage, debug_delay=0):
    time.sleep(debug_delay)

    delays = STAGESELECT_DELAYS[stage]
    print("stage: %s, delays:" % stage, delays)

    key = "RIGHT"
    d = delays[0]
    if d < 0:
        d = abs(d)
        key = "LEFT"

    hold_cmd(key, 1, d)
    hold_cmd("UP", 1, delays[1])


def reset_keys():
    cmds = []
    for _, keys in KEYS.items():
        for k in keys:
            cmds.append("xdotool keyup %s" % k)

    cmd = ";".join(cmds)
    subprocess.check_output(cmd, shell=True)




'''
Notes for choosing characters

from bottom:
    0.34
    0.43
    0.52

from left:
    0.04
    0.13
    0.22
    0.32
    0.41
    0.5
    0.59
    0.69
    0.79

'''
