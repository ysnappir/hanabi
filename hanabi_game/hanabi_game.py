from hanabi_game.hanabi_game_api import IHanabiGame
from hanabi_game.utils import get_amount_of_cards_per_player


class HanabiGame(IHanabiGame):
    def __init__(self, n_players: int):
        self._n_players = n_players
        self._number_of_cards_per_player = get_amount_of_cards_per_player(
            self._n_players
        )
