import itertools
from functools import partial

from games_repository.defs import GameAction
from games_repository.game_repository import HanabiGamesRepository
from games_repository.utils import deck_to_game_factory
from hanabi_game.defs import HanabiColor, HanabiNumber, GameVerdict
from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.utils import get_all_cards_list, get_amount_of_cards_per_player
from tests.hanabi_game.test_utils import pop_from_cards_list


def test_game_over_no_exceptions():
    game_repository = HanabiGamesRepository()
    n_players = 5
    n_hand_cards = get_amount_of_cards_per_player(n_players)
    player_ids = [game_repository.register_player(display_name=f"Player_{i}", clothes_color_number=n_players - i)
                  for i in range(n_players)]

    cards = get_all_cards_list()
    first_locate_counter = 0

    for i, (color, number) in enumerate(itertools.product(HanabiColor, HanabiNumber)):
        cards.append(pop_from_cards_list(cards_list=cards, color=color, number=number))
        first_locate_counter += 1

    # cards = cards[n_players:] + cards[:n_players]
    # first_locate_counter += n_players

    game_id = game_repository.create_game(game_factory=partial(deck_to_game_factory(
        deck=HanabiDeck(cards=cards)), red_tokens_amount=n_players + 1))

    for player_id in player_ids:
        game_repository.assign_player_to_game(player_id=player_id, game_id=game_id)

    game_repository.start_game(game_id=game_id)

    active_player_index = 0
    while game_repository.get_game_state(game_id=game_id).deck_size > first_locate_counter:
        # player_ids[i % n_players]
        assert game_repository.perform_action(action=GameAction(
            acting_player=player_ids[active_player_index % n_players],
            action_type="inform",
            informed_player=player_ids[(active_player_index + 1) % n_players],
            information_data=1,
            ))
        active_player_index += 1

        assert game_repository.perform_action(action=GameAction(
            acting_player=player_ids[active_player_index % n_players],
            action_type="burn",
            burn_card_index=n_hand_cards - 1,
            ))
        active_player_index += 1

    for _ in range(n_players):
        assert game_repository.perform_action(action=GameAction(
            acting_player=player_ids[active_player_index % n_players],
            action_type="place",
            placed_card_index=0,
            ))
        active_player_index += 1

    while game_repository.get_game_state(game_id=game_id).result is GameVerdict.ONGOING:
        assert game_repository.perform_action(action=GameAction(
            acting_player=player_ids[active_player_index % n_players],
            action_type="place",
            placed_card_index=0,
            ))
        active_player_index += 1

    assert game_repository.get_game_state(game_id=game_id).result is GameVerdict.WON
