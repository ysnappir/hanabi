import requests


if __name__ == '__main__':
    reply = requests.post("http://127.0.0.1:8080/register", json={"display_name": "Yuval",
                                                                  "number_of_colors_in_clothes": 9})
    print(reply.json()["id"])
