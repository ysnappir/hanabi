from typing import Any

from games_repository.defs import GameState


def jsonify_game_state(game_state: GameState) -> Any:
    return {
        "deck_size": game_state.deck_size,
        "blue_tokens": game_state.blue_token_amount,
        "red_tokens": game_state.red_token_amount,
        "table": {
            k.value: v.value if v is not None else None
            for k, v in game_state.table_state.items()
        },
        "hands": [
            {
                "id": player.id,
                "display_name": player.display_name,
                "cards": [
                    {"number": card.get_number().value, "color": card.get_color().value}
                    for card in player.cards
                ],
            }
            for player in game_state.hands_state
        ],
        "burnt_pile": [
            {"number": card.get_number().value, "color": card.get_color().value}
            for card in game_state.burnt_pile
        ],
    }
