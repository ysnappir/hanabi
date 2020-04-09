from games_repository.game_repository import HanabiGamesRepository


if __name__ == "__main__":
    players_display_names = ["A", "B", "C", "D"]

    repository = HanabiGamesRepository()

    game_id = repository.get_available_id()

    repository.create_game()
    players_ids = []
    for i, display_name in enumerate(players_display_names):
        players_ids.append(repository.register_player(
            display_name=display_name,
            clothes_color_number=i,
        ))
        repository.assign_player_to_game(player_id=players_ids[-1], game_id=game_id)

    repository.start_game(game_id=game_id)
    print(repository.get_game_state(game_id=game_id, player_id=players_ids[1]))

    print(repository.get_active_games())
