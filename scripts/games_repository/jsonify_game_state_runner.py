import json

from games_repository.contants import SPECTATOR_ID
from games_repository.defs import GameState, HandState, CardInfo, GameAction
from games_repository.utils import jsonify_game_state
from hanabi_game.defs import HanabiColor, HanabiNumber, GameVerdict

if __name__ == "__main__":
    game_state: GameState = GameState(
        gamd_id=23,
        status='started',
        deck_size=42,
        blue_token_amount=5,
        red_token_amount=2,
        table_state={
            HanabiColor.RAINBOW: CardInfo(HanabiColor.RAINBOW, HanabiNumber.THREE, False, False),
            HanabiColor.BLUE: None,
            HanabiColor.RED: CardInfo(HanabiColor.RED, HanabiNumber.FIVE, False, True),
        },
        hands_state=[
            HandState(
                id="p_0",
                display_name="Snap",
                cards=[
                    CardInfo(HanabiColor.RED, HanabiNumber.THREE, True, True),
                    CardInfo(HanabiColor.RED, HanabiNumber.THREE, False, True),
                ],
            ),
            HandState(
                id="p_1",
                display_name="Ethan",
                cards=[
                    CardInfo(HanabiColor.BLUE, HanabiNumber.FIVE, False, False),
                    CardInfo(HanabiColor.RED, HanabiNumber.THREE, False, False),
                ],
            ),
            HandState(
                id="p_2",
                display_name="Amos",
                cards=[
                    CardInfo(HanabiColor.YELLOW, HanabiNumber.TWO, True, False),
                    CardInfo(HanabiColor.WHITE, HanabiNumber.ONE, False, True),
                ],
            ),
        ],
        burnt_pile=[
            CardInfo(HanabiColor.YELLOW, HanabiNumber.TWO, False, False),
            CardInfo(HanabiColor.YELLOW, HanabiNumber.TWO, False, False),
            CardInfo(HanabiColor.YELLOW, HanabiNumber.TWO, False, True),
        ],
        active_player="p_1",
        last_action=GameAction(acting_player="p_0",
                               action_type="inform",
                               informed_player="p_1",
                               information_data=1,
                               placed_card_index=None,
                               burn_card_index=None,
                               ),
        result=GameVerdict.UNWINABLE,
    )
    print(json.dumps(jsonify_game_state(game_state, player_id=SPECTATOR_ID)))
    print(json.dumps(jsonify_game_state(game_state, player_id="p_1")))
