from typing import Any

from games_repository.defs import GameState, GameFactoryType
from hanabi_game.defs import HanabiColor
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
                    {"number": card.number.value if card.number is not None else None,
                     "color": card.color.value if card.color is not None else None,
                     "flipped": card.is_flipped,
                     "is_informed": card.is_informed,
                     } if card else None
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
        "last_action": None if game_state.last_action is None else {
            "acting_player": game_state.last_action.acting_player,
            "action_type": game_state.last_action.action_type,
            "informed_player": game_state.last_action.informed_player,
            "information_data": game_state.last_action.information_data,
            "placed_card_index": game_state.last_action.placed_card_index,
            "burn_card_index": game_state.last_action.burn_card_index,
        },
    }


def deck_to_game_factory(deck: IHanabiDeck) -> GameFactoryType:
    def game_factory(*args, **kwargs):
        return HanabiGame(*args, **kwargs, predifined_deck=deck)

    # noinspection PyTypeChecker
    return game_factory
