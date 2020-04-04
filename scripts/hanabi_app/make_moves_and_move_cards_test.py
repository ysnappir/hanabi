import requests


SERVER_BASE_URL = "http://127.0.0.1:5000"


if __name__ == '__main__':
    reply = requests.get(SERVER_BASE_URL)
    assert reply.status_code == 200, "Server is down, test can't be ran"

    reply = requests.post(f"{SERVER_BASE_URL}/register", json={"display_name": "Yuval",
                                                                  "number_of_colors_in_clothes": 9})
    yuval_id = reply.json()["id"]
    reply = requests.post(f"{SERVER_BASE_URL}/register", json={"display_name": "Ethan",
                                                                  "number_of_colors_in_clothes": 2})
    ethan_id = reply.json()["id"]

    reply = requests.post(f"{SERVER_BASE_URL}/create_game/{yuval_id}", json={"test_game": True})
    assert reply.status_code == 200

    game_id = reply.json().get("game_id")
    reply = requests.post(f"{SERVER_BASE_URL}/join_game/{ethan_id}/{game_id}")
    assert reply.status_code == 200

    reply = requests.get(f"{SERVER_BASE_URL}/game_state/{yuval_id}/{game_id}")
    assert reply.status_code == 200

    reply = requests.post(f"{SERVER_BASE_URL}/start_game/{game_id}")
    assert reply.status_code == 200

    reply = requests.get(f"{SERVER_BASE_URL}/game_state/{yuval_id}/{game_id}")
    assert reply.status_code == 200

    reply = requests.post(f"{SERVER_BASE_URL}/make_turn/inform/{yuval_id}", json={"informed_player_id": ethan_id,
                                                                                      "information": 5,
                                                                                      })
    assert reply.status_code == 200

    reply = requests.get(f"{SERVER_BASE_URL}/game_state/{yuval_id}/{game_id}")
    assert reply.status_code == 200 and (reply.json()["blue_tokens"] == 7 and
                                         reply.json()["active_player_id"] == ethan_id)

    reply = requests.post(f"{SERVER_BASE_URL}/move_card/{ethan_id}", json={"move_from_index": 4,
                                                                               "move_to_index": 0,
                                                                               })
    assert reply.status_code == 200

    reply = requests.get(f"{SERVER_BASE_URL}/game_state/{yuval_id}/{game_id}")
    assert reply.status_code == 200 and (reply.json()["blue_tokens"] == 7 and
                                         reply.json()["active_player_id"] == ethan_id and
                                         reply.json()["hands"][1]["cards"][0]["number"] == 5
                                         )

    reply = requests.post(f"{SERVER_BASE_URL}/make_turn/inform/{ethan_id}",
                          json={"informed_player_id": yuval_id,
                                "information": 1,
                                })
    assert reply.status_code == 200

    reply = requests.get(f"{SERVER_BASE_URL}/game_state/{yuval_id}/{game_id}")
    assert reply.status_code == 200 and (reply.json()["blue_tokens"] == 6 and
                                         reply.json()["active_player_id"] == yuval_id
                                         )

    # Ensuring the right player is checked
    reply = requests.post(f"{SERVER_BASE_URL}/make_turn/burn/{ethan_id}",
                          json={"card_index": 4})
    assert reply.status_code == 400

    reply = requests.post(f"{SERVER_BASE_URL}/make_turn/place/{yuval_id}",
                          json={"informed_player_id": yuval_id,
                                "card_index": 0,
                                })
    assert reply.status_code == 200

    reply = requests.get(f"{SERVER_BASE_URL}/game_state/{yuval_id}/{game_id}")
    assert (reply.status_code == 200
            and reply.json()["table"]["red"] == 1
            and reply.json()["active_player_id"] == ethan_id
            and reply.json()["hands"][0]["cards"][0] == {"color": "blue", "number": 1}
            and len(reply.json()["hands"][0]["cards"]) == len(reply.json()["hands"][1]["cards"])
            )

    reply = requests.post(f"{SERVER_BASE_URL}/make_turn/burn/{ethan_id}",
                          json={"card_index": 4,
                                })
    assert reply.status_code == 200

    reply = requests.get(f"{SERVER_BASE_URL}/game_state/{yuval_id}/{game_id}")
    assert (reply.status_code == 200
            and reply.json()["blue_tokens"] == 7
            and reply.json()["active_player_id"] == yuval_id
            and len(reply.json()["burnt_pile"]) == 1
            and len(reply.json()["hands"][0]["cards"]) == len(reply.json()["hands"][1]["cards"])
            )
