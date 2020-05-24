from hanabi_game.defs import HanabiColor, HanabiNumber, GameVerdict
from hanabi_game.utils import get_amount_of_cards_per_player
import requests

SERVER_BASE_URL = "http://127.0.0.1:5000"


def test_game_over_no_exceptions():
    n_players = 5
    first_locate_counter = len(HanabiNumber) * len(HanabiColor)
    n_hand_cards = get_amount_of_cards_per_player(n_players)

    reply = requests.get(SERVER_BASE_URL)
    assert reply.status_code == 200, "Server is down, test can't be ran"

    player_ids = []
    for i in range(n_players):
        reply = requests.post(f"{SERVER_BASE_URL}/register", json={"display_name": f"Player_{i}",
                                                                   "number_of_colors_in_clothes": n_players - i})
        assert reply.status_code == 200
        player_id = reply.json()["id"]
        player_ids.append(player_id)

    reply = requests.post(f"{SERVER_BASE_URL}/create_game/{player_ids[0]}", json={"test_game": "winning"})
    assert reply.status_code == 200

    game_id = reply.json().get("game_id")

    for player_id in player_ids[1:]:
        reply = requests.post(f"{SERVER_BASE_URL}/join_game/{player_id}/{game_id}")
        assert reply.status_code == 200

    reply = requests.post(f"{SERVER_BASE_URL}/start_game/{game_id}")
    assert reply.status_code == 200

    active_player_index = 0
    while requests.get(f"{SERVER_BASE_URL}/player_state/{player_ids[0]}").json()["deck_size"] > first_locate_counter:
        assert requests.post(f"{SERVER_BASE_URL}/make_turn/inform/{player_ids[active_player_index % n_players]}",
                             json={
                                 "informed_player_id": player_ids[(active_player_index + 1) % n_players],
                                 "information": 1,
                             }).status_code == 200
        active_player_index += 1

        assert requests.post(f"{SERVER_BASE_URL}/make_turn/burn/{player_ids[active_player_index % n_players]}",
                             json={
                                 "informed_player_id": player_ids[(active_player_index + 1) % n_players],
                                 "card_index": n_hand_cards - 1,
                             }).status_code == 200
        active_player_index += 1

    for _ in range(n_players):
        reply = requests.post(f"{SERVER_BASE_URL}/make_turn/place/{player_ids[active_player_index % n_players]}",
                              json={
                                  "card_index": 0,
                                  })
        assert reply.status_code == 200
        active_player_index += 1

    # while requests.get(f"{SERVER_BASE_URL}/player_state/{player_ids[0]}").json()['result'] == GameVerdict.ONGOING.value:
    for _ in range(first_locate_counter):
        reply = requests.post(f"{SERVER_BASE_URL}/make_turn/place/{player_ids[active_player_index % n_players]}",
                              json={
                                  "card_index": 0,
                                  })
        assert reply.status_code == 200
        active_player_index += 1

    assert requests.get(f"{SERVER_BASE_URL}/player_state/{player_ids[0]}").json()['result'] == GameVerdict.WON.value
