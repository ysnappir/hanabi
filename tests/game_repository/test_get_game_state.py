from games_repository.game_repository import HanabiGamesRepository


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