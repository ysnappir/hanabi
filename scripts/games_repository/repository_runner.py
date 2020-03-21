from games_repository.game_repository import HanabiGamesRepository


if __name__ == "__main__":
    players_ids = ["A", "B", "C", "D"]

    repository = HanabiGamesRepository()

    game_id = repository.get_available_id()

    repository.create_game(game_id=game_id)

    for i, player_id in enumerate(players_ids):
        repository.register_player(
            player_id=player_id,
            display_name=player_id,
            game_id=game_id,
            clothes_color_number=i,
        )

    repository.start_game(game_id=game_id)
    print(repository.get_game_state(game_id=game_id, player_id=players_ids[1]))

    print(repository.get_active_games())
