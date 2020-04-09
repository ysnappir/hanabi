import json

from games_repository.defs import GameState, HandState, CardInfo
from games_repository.utils import jsonify_game_state
from hanabi_game.defs import HanabiColor, HanabiNumber
from hanabi_game.hanabi_card import HanabiCard

if __name__ == "__main__":
    game_state: GameState = GameState(
        deck_size=42,
        blue_token_amount=5,
        red_token_amount=2,
        table_state={
            HanabiColor.RAINBOW: HanabiNumber.THREE,
            HanabiColor.BLUE: None,
            HanabiColor.RED: HanabiNumber.FIVE,
        },
        hands_state=[
            HandState(
                id="p_0",
                display_name="Snap",
                cards=[
                    CardInfo(HanabiColor.RED, HanabiNumber.THREE, True),
                    CardInfo(HanabiColor.RED, HanabiNumber.THREE, False),
                ],
            ),
            HandState(
                id="p_1",
                display_name="Ethan",
                cards=[
                    CardInfo(HanabiColor.BLUE, HanabiNumber.FIVE, False),
                    CardInfo(HanabiColor.RED, HanabiNumber.THREE, False),
                ],
            ),
            HandState(
                id="p_2",
                display_name="Amos",
                cards=[
                    CardInfo(HanabiColor.YELLOW, HanabiNumber.TWO, True),
                    CardInfo(HanabiColor.WHITE, HanabiNumber.ONE, False),
                ],
            ),
        ],
        burnt_pile=[
            HanabiCard(HanabiColor.YELLOW, HanabiNumber.TWO),
            HanabiCard(HanabiColor.YELLOW, HanabiNumber.TWO),
            HanabiCard(HanabiColor.YELLOW, HanabiNumber.TWO),
        ],
        active_player="p_1"
    )
    print(json.dumps(jsonify_game_state(game_state)))
