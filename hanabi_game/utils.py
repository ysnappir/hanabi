def get_amount_of_cards_per_player(n_players: int) -> int:
    if n_players in [2, 3]:
        return 5
    elif n_players in [4, 5]:
        return 4
    raise AssertionError(f"Hanabi is for 2-5 players ({n_players} given)")
