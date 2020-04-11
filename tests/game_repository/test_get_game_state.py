from games_repository.defs import MoveCardRequest, GameAction
from games_repository.game_repository import HanabiGamesRepository
from games_repository.utils import jsonify_game_state, deck_to_game_factory
from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.utils import get_all_cards_list


def test_get_state_of_non_started_game():
    repository = HanabiGamesRepository()

    yuval_id = repository.register_player(display_name="Yuval", clothes_color_number=2)
    ethan_id = repository.register_player(display_name="Ethan", clothes_color_number=9)
    game_id = repository.create_game()

    repository.assign_player_to_game(player_id=yuval_id, game_id=game_id)
    repository.assign_player_to_game(player_id=ethan_id, game_id=game_id)

    state = repository.get_game_state(game_id=game_id)
    assert all(len(player_state.cards) == 0 for player_state in state.hands_state)
    assert state.active_player == ethan_id


def test_flipped_cards():
    repository = HanabiGamesRepository()

    yuval_id = repository.register_player(display_name="Yuval", clothes_color_number=2)
    ethan_id = repository.register_player(display_name="Ethan", clothes_color_number=9)
    game_id = repository.create_game()

    repository.assign_player_to_game(player_id=yuval_id, game_id=game_id)
    repository.assign_player_to_game(player_id=ethan_id, game_id=game_id)
    repository.start_game(game_id=game_id)

    state_json = jsonify_game_state(repository.get_game_state(game_id=game_id), player_id=ethan_id)
    assert not state_json["hands"][0]["cards"][0].get("flipped", False)

    assert repository.perform_card_motion(
        card_motion_request=MoveCardRequest(player_id=ethan_id, initial_card_index=4, final_card_index=0))

    state_json = jsonify_game_state(repository.get_game_state(game_id=game_id), player_id=ethan_id)
    assert state_json["hands"][0]["cards"][0].get("flipped", False)
    assert not state_json["hands"][0]["cards"][1].get("flipped", False)


def test_last_action():
    repository = HanabiGamesRepository()

    yuval_id = repository.register_player(display_name="Yuval", clothes_color_number=1)
    ethan_id = repository.register_player(display_name="Ethan", clothes_color_number=5)
    game_id = repository.create_game()

    repository.assign_player_to_game(player_id=yuval_id, game_id=game_id)
    repository.assign_player_to_game(player_id=ethan_id, game_id=game_id)
    repository.start_game(game_id=game_id)

    action_dict = {'acting_player': '2', 'action_type': 'inform', 'informed_player': '1', 'information_data': 1,
                   'placed_card_index': None, 'burn_card_index': None}

    assert repository.perform_action(GameAction(**action_dict))

    state_json = jsonify_game_state(repository.get_game_state(game_id=game_id), player_id=ethan_id)
    assert state_json["last_action"] == action_dict


def test_flipped_cards_dynamics():
    repository = HanabiGamesRepository()

    yuval_id = repository.register_player(display_name="Yuval", clothes_color_number=1)
    ethan_id = repository.register_player(display_name="Ethan", clothes_color_number=3)
    game_id = repository.create_game(game_factory=deck_to_game_factory(deck=HanabiDeck(cards=get_all_cards_list())))

    repository.assign_player_to_game(player_id=yuval_id, game_id=game_id)
    repository.assign_player_to_game(player_id=ethan_id, game_id=game_id)
    repository.start_game(game_id=game_id)

    ethan_informs_1 = GameAction(acting_player=ethan_id,
                                 action_type="inform",
                                 informed_player=yuval_id,
                                 information_data=1,
                                 placed_card_index=None,
                                 burn_card_index=None,
                                 )

    assert repository.perform_action(action=ethan_informs_1)

    repository.perform_card_motion(card_motion_request=MoveCardRequest(player_id=yuval_id,
                                                                       initial_card_index=2,
                                                                       final_card_index=0,
                                                                       ))
    repository.perform_card_motion(card_motion_request=MoveCardRequest(player_id=yuval_id,
                                                                       initial_card_index=1,
                                                                       final_card_index=1,
                                                                       ))

    state_json = jsonify_game_state(repository.get_game_state(game_id=game_id), player_id=ethan_id)
    assert state_json["hands"][1]["cards"][1].get("flipped", False)
    assert not state_json["hands"][1]["cards"][2].get("flipped", False)

    assert repository.perform_action(action=GameAction(
        acting_player=yuval_id,
        action_type='place',
        informed_player=None,
        information_data=None,
        placed_card_index=0,
        burn_card_index=None,
    ))

    state_json = jsonify_game_state(repository.get_game_state(game_id=game_id), player_id=ethan_id)
    assert state_json["hands"][1]["cards"][0].get("flipped", False)
    assert not state_json["hands"][1]["cards"][1].get("flipped", False)
