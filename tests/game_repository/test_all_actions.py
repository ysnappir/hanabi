from games_repository.defs import GameAction, MoveCardRequest
from games_repository.game_repository import HanabiGamesRepository
from games_repository.utils import deck_to_game_factory
from hanabi_game.defs import HanabiNumber, HanabiColor
from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.utils import get_all_cards_list


def test_moving_hot_seat_to_pinned():
    game_repository = HanabiGamesRepository()
    yuval_id = game_repository.register_player(display_name="Yuval", clothes_color_number=9)
    ethan_id = game_repository.register_player(display_name="Ethan", clothes_color_number=2)

    game_id = game_repository.create_game(
        game_factory=deck_to_game_factory(deck=HanabiDeck(cards=get_all_cards_list())))
    game_repository.assign_player_to_game(player_id=yuval_id, game_id=game_id)
    game_repository.assign_player_to_game(player_id=ethan_id, game_id=game_id)

    game_repository.start_game(game_id=game_id)

    assert game_repository.perform_action(action=GameAction(
        acting_player=yuval_id,
        action_type="inform",
        informed_player=ethan_id,
        information_data=5,
        placed_card_index=None,
        burn_card_index=None,
    ))

    game_state = game_repository.get_game_state(game_id=game_id)
    assert game_state.active_player == ethan_id and game_state.blue_token_amount == 7

    game_repository.perform_card_motion(card_motion_request=MoveCardRequest(
        player_id=ethan_id,
        initial_card_index=4,
        final_card_index=0
    ))

    game_state = game_repository.get_game_state(game_id=game_id)
    assert game_state.hands_state[1].cards[0].number.value == 5

    assert game_repository.perform_action(GameAction(acting_player=ethan_id,
                                                     action_type="inform",
                                                     informed_player=yuval_id,
                                                     information_data=1,
                                                     placed_card_index=None,
                                                     burn_card_index=None,
                                                     ))

    assert game_repository.perform_action(GameAction(acting_player=yuval_id,
                                                     action_type="place",
                                                     informed_player=None,
                                                     information_data=None,
                                                     placed_card_index=0,
                                                     burn_card_index=None,
                                                     ))

    game_state = game_repository.get_game_state(game_id=game_id)
    assert (game_state.table_state[HanabiColor.RED] is HanabiNumber.ONE
            and game_state.active_player == ethan_id
            and (game_state.hands_state[0].cards[0].number,
                 game_state.hands_state[0].cards[0].color) == (HanabiNumber.ONE, HanabiColor.BLUE)
            and len(game_state.hands_state[1].cards) == len(game_state.hands_state[0].cards)
            )

    assert game_repository.perform_action(GameAction(acting_player=ethan_id,
                                                     action_type="burn",
                                                     informed_player=None,
                                                     information_data=None,
                                                     placed_card_index=None,
                                                     burn_card_index=4,
                                                     ))

    game_state = game_repository.get_game_state(game_id=game_id)
    assert (len(game_state.burnt_pile) == 1
            and game_state.blue_token_amount == 7
            and game_state.active_player == yuval_id
            and len(game_state.hands_state[1].cards) == len(game_state.hands_state[0].cards)
            )
