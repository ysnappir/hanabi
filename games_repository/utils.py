from typing import Any

from games_repository.defs import GameState, GameFactoryType
from hanabi_game.defs import HanabiColor, HanabiNumber
from hanabi_game.hanabi_card import HanabiCard
from hanabi_game.hanabi_game import HanabiGame
from hanabi_game.hanabi_game_api import IHanabiDeck


def jsonify_game_state(game_state: GameState) -> Any:
    return {
        "deck_size": game_state.deck_size,
        "blue_tokens": game_state.blue_token_amount,
        "red_tokens": game_state.red_token_amount,
        "table": {
            k.value: game_state.table_state[k].value if game_state.table_state.get(k) is not None else 0
            for k in HanabiColor
        },
        "hands": [
            {
                "id": player.id,
                "display_name": player.display_name,
                "cards": [
                    {"number": card.get_number().value, "color": card.get_color().value} if card else None
                    for card in player.cards
                ],
            }
            for player in game_state.hands_state
        ],
        "burnt_pile": [
            {"number": card.get_number().value, "color": card.get_color().value}
            for card in game_state.burnt_pile
        ],
        "active_player_id": game_state.active_player,
    }


def deck_to_game_factory(deck: IHanabiDeck) -> GameFactoryType:
    def game_factory(*args, **kwargs):
        return HanabiGame(*args, **kwargs, predifined_deck=deck)

    # noinspection PyTypeChecker
    return game_factory
