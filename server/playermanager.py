import keys
import notify
import random
import string
import subprocess


class PlayerManager():
    def __init__(self, socketio):
        self.socketio = socketio

        self.enabled = False

        # { username: {secret: xxx, sid: xxx} }
        self.userinfo = {}

        # List of usernames
        self.queue = []

        # { username: player_num }
        self.players = {}


    def _sid_to_username(self, sid):
        for username in self.userinfo:
            if self.userinfo[username]["sid"] == sid:
                return username
        return None


    def _is_online(self, username):
        if username in self.userinfo:
            print("is online?", self.userinfo[username]["online"])
            return self.userinfo[username]["online"]

        return False


    def _get_player_num(self, sid):
        '''
        Return 0, 1, 2, 3 corresponding to the player sid
        Return -1 if the sid is not one of the current players
        '''

        # Get corresponding username
        username = self._sid_to_username(sid)

        # Username doesn't exist, should never happen
        if not username:
            print("SHOULDNT HAPPEN. Username does not exist for sid:", sid)
            return -1

        # Return -1 if username is not a current player
        if username not in self.players:
            return -1

        # Return the corresponding player num
        return self.players[username]


    def get_current_players(self):
        return self.players


    def next(self):
        # Step-by-step queue process
        # (I'm doing this queue process in a "stupid" way for simplicity)

        # 1) Get the first 4 (or less if queue < 4) players in queue
        new_players = []
        i = 0
        while len(new_players) < 4 and i < len(self.queue):
            newp = self.queue[i]

            # check if online
            if self._is_online(newp):
                new_players.append(newp)
                self.queue.pop(i)

            else:
                i += 1

        # 2) Reset players, setting username: player_num
        self.players = {}
        for i, username in enumerate(new_players):
            self.players[username] = i

        # 3) Add these players back at the end of the queue
        for username in new_players:
            self.queue.append(username)


        # Debug:
        print("Players are now:")
        print(self.players)


    def user_login(self, sid, username, character, secret):
        if not 1 <= len(username) <= 8:
            self.socketio.emit("login_failure", "", room=sid)
            return


        # debug
        print("existing userinfo:")
        print(self.userinfo)

        # 1) If new user
        if username not in self.userinfo:
            print("## Add new user!")
            # Generate 20-letter "secret"
            secret = "".join(random.choices(string.ascii_lowercase, k=20))

            self._add_user(username, character, secret, sid)

            notify.send("Welcome, %s!" % username)

        # 2) If login is valid
        elif secret == self.userinfo[username]["secret"]:
            print("## Login valid, welcome back disconnected user")
            # Login successful!
            self._add_user(username, character, secret, sid)

            notify.send("%s reconnected!" % username)

        # 3) Login failed
        else:
            # Send login failure to client (username already exists)
            self.socketio.emit("login_failure", "", room=sid)



    def _add_user(self, username, character, secret, sid):
        info = {"username": username, "character": character, "secret": secret, "sid": sid, "online": True}
        self.socketio.emit("login_success", info, room=sid)

        # Add to userinfo
        self.userinfo[username] = info

        # Add user to queue if not already
        if username not in self.queue:
            self.queue.append(username)




    def remove(self, sid):
        username = self._sid_to_username(sid)
        print("Disconnect, removing username:", username)

        if username:
            self.userinfo[username]["online"] = False

            notify.send("%s disconnected!" % username)


    # def remove(self, player_id):
    #     index = self.get_index(player_id)
    #     if index != -1:
    #         self.players[index] = None
    #
    # def add(self, player_id):
    #     for i, pid in enumerate(self.players):
    #         if pid == None:
    #             self.players[i] = player_id
    #             return
    #     print("Error: cannot add more players")
    #
    # def get_index(self, player_id):
    #     if player_id not in self.players:
    #         return -1
    #     return self.players.index(player_id)

    """
    Key
    """
    def press_key(self, user_id, keycode, keydown, admin_override=False):
        # print("press key")
        if not self.enabled and not admin_override:
            return

        if admin_override:
            player_num = user_id
        else:
            player_num = self._get_player_num(user_id)

        # print("player_num:", player_num)

        if player_num >= 0:
            keys.press_cmd(keycode, player_num, keydown)


    """
    Enable/disable keypresses
    """
    def set_enabled(self, b):
        self.enabled = b


    """
    DEBUG
    """
    def print_players(self):
        for i, pid in enumerate(self.players):
            print(i, pid)


