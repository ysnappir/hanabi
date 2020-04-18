# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START gae_python37_render_template]
from flask import Flask, request, render_template
from flask_cors import CORS

from games_repository.contants import SPECTATOR_ID
from games_repository.defs import GameIdType, GameAction, MoveCardRequest
from games_repository.games_repository_api import IGamesRepository
from games_repository.utils import jsonify_game_state, deck_to_game_factory
from gcloud_datastore.gcloud_datastore_read_write import get_game_repository, save_game_repository_state
from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.utils import get_all_cards_list

app = Flask(__name__, template_folder="client/build", static_folder="client/build/static")
cors = CORS(app, resources={r"/*": {"origins": "*"}})


game_repository: IGamesRepository = get_game_repository()


@app.route('/')
def root():
    # For the sake of example, use static information to inflate the template.
    # This will be replaced with real information in later steps.
    # dummy_times = [datetime.datetime(2018, 1, 1, 10, 0, 0),
    #                datetime.datetime(2018, 1, 2, 10, 30, 0),
    #                datetime.datetime(2018, 1, 3, 11, 0, 0),
    #                ]

    return render_template("index.html")


@app.route("/register", methods=["post"])
def register():
    try:
        player_id = game_repository.register_player(display_name=request.json["display_name"],
                                                    clothes_color_number=request.json["number_of_colors_in_clothes"],
                                                    )
        save_game_repository_state(game_repository)
        return {"id": player_id}, 200
    except KeyError:
        return "", 400


@app.route("/create_game/<player_id>", methods=["post"])
def create_game(player_id: str):
    try:
        is_test_game = request.get_json().get("test_game", False) is True
        if is_test_game:

            game_id = game_repository.create_game(
                game_factory=deck_to_game_factory(deck=HanabiDeck(cards=get_all_cards_list())))
        else:
            game_id = game_repository.create_game()
        assert game_repository.assign_player_to_game(player_id=player_id, game_id=game_id)
        save_game_repository_state(game_repository)
        return {"game_id": game_id}, 200
    except KeyError:
        return "", 400


@app.route("/join_game/<player_id>/<game_id>", methods=["post"])
def join_game(player_id: str, game_id: str):
    try:
        assert game_repository.assign_player_to_game(player_id=player_id, game_id=GameIdType(game_id))
        save_game_repository_state(game_repository)
        return {}, 200
    except KeyError:
        return "", 400


@app.route("/start_game/<game_id>", methods=["post"])
def start_game(game_id: str):
    try:
        assert game_repository.start_game(game_id=GameIdType(game_id))
        save_game_repository_state(game_repository)
        return {}, 200
    except KeyError:
        return "", 400


@app.route("/player_state/<player_id>", methods=["get"])
def player_state(player_id: str):
    try:
        assert player_id != SPECTATOR_ID
        game_id = game_repository.get_players_game(player_id=player_id)

        ret_val = jsonify_game_state(game_repository.get_game_state(game_id=GameIdType(game_id)), player_id=player_id)
        return ret_val, 200
    except KeyError:
        return "", 400


@app.route("/game_state/<game_id>", methods=["get"])
def game_state(game_id: str):
    try:
        ret_val = jsonify_game_state(game_repository.get_game_state(game_id=GameIdType(game_id)),
                                     player_id=SPECTATOR_ID)
        return ret_val, 200
    except KeyError:
        return "", 400


@app.route("/make_turn/inform/<player_id>", methods=["post"])
def inform_move(player_id: str):
    try:
        print("making inform")
        game_id = game_repository.get_players_game(player_id=player_id)
        assert game_id is not None

        payload = request.get_json()
        action = GameAction(
            acting_player=player_id,
            action_type="inform",
            informed_player=payload["informed_player_id"],
            information_data=payload["information"],  # small letters color or a number
            placed_card_index=None,
            burn_card_index=None,
        )
        print(action)
        assert game_repository.perform_action(action=action)
        save_game_repository_state(game_repository)

        return jsonify_game_state(game_repository.get_game_state(game_id=GameIdType(game_id)), player_id=player_id), 200
    except KeyError:
        return "", 400
    except AssertionError as e:
        print(e)
        return str(e), 400


@app.route("/make_turn/burn/<player_id>", methods=["post"])
def burn_move(player_id: str):
    try:
        payload = request.get_json()

        game_id = game_repository.get_players_game(player_id=player_id)
        assert game_id is not None

        ret_val = game_repository.perform_action(GameAction(
            acting_player=player_id,
            action_type="burn",
            informed_player=None,
            information_data=None,
            placed_card_index=None,
            burn_card_index=payload["card_index"],
        ))
        if ret_val:
            save_game_repository_state(game_repository)

            return jsonify_game_state(game_repository.get_game_state(game_id=GameIdType(game_id)),
                                      player_id=player_id), 200
        return "Not your turn!", 400
    except KeyError:
        return "", 400


@app.route("/make_turn/place/<player_id>", methods=["post"])
def place_move(player_id: str):
    try:
        payload = request.get_json()
        print(f"Handling placing with payload: {payload}")

        game_id = game_repository.get_players_game(player_id=player_id)
        assert game_id is not None

        assert game_repository.perform_action(GameAction(
            acting_player=player_id,
            action_type="place",
            informed_player=None,
            information_data=None,
            placed_card_index=payload["card_index"],
            burn_card_index=None,
        ))

        save_game_repository_state(game_repository)
        return jsonify_game_state(game_repository.get_game_state(game_id=GameIdType(game_id)), player_id=player_id), 200
    except KeyError:
        return "", 400


@app.route("/move_card/<player_id>", methods=["post"])
def move_card(player_id: str):
    try:
        payload = request.get_json()

        game_id = game_repository.get_players_game(player_id=player_id)
        assert game_id is not None

        assert game_repository.perform_card_motion(card_motion_request=MoveCardRequest(
            player_id=player_id,
            initial_card_index=payload["move_from_index"],
            final_card_index=payload["move_to_index"],
        ))

        save_game_repository_state(game_repository)
        return jsonify_game_state(game_repository.get_game_state(game_id=GameIdType(game_id)), player_id=player_id), 200
    except KeyError:
        return "", 400
    except AssertionError:
        return "Couldn't move the card", 400


@app.route("/rematch/<player_id>", methods=["post"])
def rematch(player_id: str):
    try:
        print("Rematching")
        game_id = game_repository.get_players_game(player_id=player_id)
        print(f"Game id to close {game_id}")
        assert game_id is not None

        player_ids = [hand.id for hand in game_repository.get_game_state(game_id).hands_state]
        print(f"Players to move {player_ids}")

        game_repository.finish_game(game_id=game_id)
        print(f"Finished game!")

        new_game_id = game_repository.create_game()
        print(f"Game {new_game_id} created")
        for p_id in player_ids:
            assert game_repository.assign_player_to_game(player_id=p_id, game_id=new_game_id)
            assert game_repository.get_players_game(player_id=p_id) == new_game_id

        print(f"Assigned players")
        assert game_repository.start_game(game_id=new_game_id)

        save_game_repository_state(game_repository)
        return jsonify_game_state(game_state=game_repository.get_game_state(game_id=GameIdType(new_game_id)),
                                  player_id=player_id), 200
    except KeyError:
        return "", 400
    except AssertionError:
        return "Couldn't find a game to restart", 400


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host='127.0.0.1', debug=True)
# [START gae_python37_render_template]
