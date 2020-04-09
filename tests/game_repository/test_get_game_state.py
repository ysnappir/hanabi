from games_repository.defs import MoveCardRequest
from games_repository.game_repository import HanabiGamesRepository
from games_repository.utils import jsonify_game_state


def test_get_state_of_non_started_game():
    repository = HanabiGamesRepository()

    yuval_id = repository.register_player(display_name="Yuval", clothes_color_number=2)
    ethan_id = repository.register_player(display_name="Ethan", clothes_color_number=9)
    game_id = repository.create_game()

    repository.assign_player_to_game(player_id=yuval_id, game_id=game_id)
    repository.assign_player_to_game(player_id=ethan_id, game_id=game_id)

    state = repository.get_game_state(game_id=game_id, player_id=ethan_id)
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

    state_json = jsonify_game_state(repository.get_game_state(game_id=game_id, player_id=ethan_id))
    assert not state_json["hands"][0]["cards"][0].get("flipped", False)

    assert repository.perform_card_motion(
        card_motion_request=MoveCardRequest(player_id=ethan_id, initial_card_index=4, final_card_index=0))

    state_json = jsonify_game_state(repository.get_game_state(game_id=game_id, player_id=ethan_id))
    assert state_json["hands"][0]["cards"][0].get("flipped", False)
    assert not state_json["hands"][0]["cards"][1].get("flipped", False)
