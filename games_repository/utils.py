from typing import Any, Dict, Optional

from games_repository.defs import GameState, GameFactoryType, NetworkPlayerIdType, CardInfo
from hanabi_game.defs import HanabiColor
from hanabi_game.hanabi_game import HanabiGame
from hanabi_game.hanabi_game_api import IHanabiDeck


def _jsonify_card(card: Optional[CardInfo], hide: bool = False) -> Dict[str, Any]:
    if card is None:
        return {"number": None, "color": None, "flipped": False, "highlighted": False}
    return {"number": card.number.value if not hide and card.number is not None else None,
            "color": card.color.value if not hide and card.color is not None else None,
            "flipped": card.is_flipped,
                "highlighted": card.highlighted,
            }


def jsonify_game_state(game_state: GameState, player_id: NetworkPlayerIdType) -> Any:
    player_index = [d.id for d in game_state.hands_state].index(player_id)
    return {
        "status": game_state.status,
        "result": game_state.result.value,
        "deck_size": game_state.deck_size,
        "blue_tokens": game_state.blue_token_amount,
        "red_tokens": game_state.red_token_amount,
        "table": {
            k.value: _jsonify_card(game_state.table_state.get(k))
            for k in HanabiColor
        },
        "hands": [
            {
                "id": player.id,
                "display_name": player.display_name,
                "cards": [_jsonify_card(card=card, hide=(i == 0))
                          for card in player.cards],
            }
            for i, player in enumerate(game_state.hands_state[player_index:] + game_state.hands_state[:player_index])
        ],
        "burnt_pile": [_jsonify_card(card=card) for card in game_state.burnt_pile],
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
