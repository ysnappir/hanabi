import json

from games_repository.defs import GameState, HandState, CardInfo, GameAction
from games_repository.utils import jsonify_game_state
from hanabi_game.defs import HanabiColor, HanabiNumber
from hanabi_game.hanabi_card import HanabiCard

if __name__ == "__main__":
    game_state: GameState = GameState(
        status='started',
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
                    CardInfo(None, None, True, True),
                    CardInfo(None, None, False, True),
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
            HanabiCard(HanabiColor.YELLOW, HanabiNumber.TWO),
            HanabiCard(HanabiColor.YELLOW, HanabiNumber.TWO),
            HanabiCard(HanabiColor.YELLOW, HanabiNumber.TWO),
        ],
        active_player="p_1",
        last_action=GameAction(acting_player="p_0",
                               action_type="inform",
                               informed_player="p_1",
                               information_data=1,
                               placed_card_index=None,
                               burn_card_index=None,
                               )
    )
    print(json.dumps(jsonify_game_state(game_state, player_id="p_1")))
