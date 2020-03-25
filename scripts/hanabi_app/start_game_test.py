import requests


if __name__ == '__main__':
    reply = requests.post("http://127.0.0.1:8080/register", json={"display_name": "Yuval",
                                                                  "number_of_colors_in_clothes": 9})
    yuval_id = reply.json()["id"]
    reply = requests.post("http://127.0.0.1:8080/register", json={"display_name": "Ethan",
                                                                  "number_of_colors_in_clothes": 2})
    ethan_id = reply.json()["id"]

    reply = requests.post(f"http://127.0.0.1:8080/create_game/{yuval_id}")
    assert reply.status_code == 200
    game_id = reply.json().get("game_id")
    reply = requests.post(f"http://127.0.0.1:8080/join_game/{ethan_id}/{game_id}")
    assert reply.status_code == 200

