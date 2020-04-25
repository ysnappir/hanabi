from typing import Any, Dict, Optional, Iterable

from games_repository.contants import SPECTATOR_ID
from games_repository.defs import GameState, GameFactoryType, NetworkPlayerIdType, CardInfo, HandState
from hanabi_game.defs import HanabiColor, HanabiNumber
from hanabi_game.hanabi_game import HanabiGame
from hanabi_game.hanabi_game_api import IHanabiDeck


def _jsonify_card(card: Optional[CardInfo], hide: bool = False) -> Dict[str, Any]:
    if card is None:
        return {"number": None, "color": None, "flipped": False, "highlighted": False}
    return {**
            {"number": card.number.value if not hide and card.number is not None else None,
             "color": card.color.value if not hide and card.color is not None else None,
             "flipped": card.is_flipped,
             "highlighted": card.highlighted,
             },
            **(
                {
                    "informed_numbers": {k.value: v
                                         for k, v in card.informed_values.items()
                                         if isinstance(k, HanabiNumber)
                                         },
                    "informed_colors": {k.value: v
                                        for k, v in card.informed_values.items()
                                        if isinstance(k, HanabiColor)
                                        },
                    }
                if card.informed_values is not None else {}
                )
            }


def _get_ordered_players_hands(game_state: GameState, player_id: NetworkPlayerIdType) -> Iterable[HandState]:
    if player_id == SPECTATOR_ID:
        return game_state.hands_state

    player_index = [d.id for d in game_state.hands_state].index(player_id)
    return game_state.hands_state[player_index:] + game_state.hands_state[:player_index]


def jsonify_game_state(game_state: GameState, player_id: NetworkPlayerIdType) -> Any:
    hands = [{
            "id": player.id,
            "display_name": player.display_name,
            "total_turns_time": player.total_time,
            "cards": [_jsonify_card(card=card, hide=(player.id == player_id))
                      for card in player.cards],
        }
        for player in _get_ordered_players_hands(game_state=game_state, player_id=player_id)]
    return {
        "game_id": game_state.gamd_id,
        "status": game_state.status,
        "result": game_state.result.value,
        "deck_size": game_state.deck_size,
        "blue_tokens": game_state.blue_token_amount,
        "red_tokens": game_state.red_token_amount,
        "table": {
            k.value: _jsonify_card(game_state.table_state.get(k))
            for k in HanabiColor
        },
        "hands": hands,
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
        "state_timestamp": game_state.timestamp,
    }


def deck_to_game_factory(deck: IHanabiDeck) -> GameFactoryType:
    def game_factory(*args, **kwargs):
        return HanabiGame(*args, **kwargs, predifined_deck=deck)

    # noinspection PyTypeChecker
    return game_factory
