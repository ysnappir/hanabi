from typing import List

from hanabi_game.defs import HanabiNumber, HanabiColor
from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.hanabi_game import HanabiGame
from hanabi_game.hanabi_game_api import IHanabiCard
from hanabi_game.hanabi_moves import IHanabiInfromMove, HanabiColorUpdate
from hanabi_game.utils import get_all_cards_list, get_amount_of_cards_per_player, pop_from_cards_list


def test_inform_only_single_player_cards():
    n_players = 2
    cards: List[IHanabiCard] = get_all_cards_list()
    two_white_cards = [pop_from_cards_list(cards, HanabiColor.WHITE, number=HanabiNumber.TWO)
                       for _ in range(2)]

    cards_per_player = get_amount_of_cards_per_player(n_players)
    for i in range(len(two_white_cards)):
        cards.insert(i * cards_per_player, two_white_cards.pop(0))

    game = HanabiGame(n_players=n_players, predifined_deck=HanabiDeck(cards=cards), starting_player=0,
                      red_tokens_amount=5)

    game_state = game.get_state()
    assert (game_state.get_hand(0).get_cards()[0].get_color() is game_state.get_hand(1).get_cards()[0].get_color() and
            game_state.get_hand(0).get_cards()[0].get_number() is game_state.get_hand(1).get_cards()[0].get_number())

    assert game.perform_move(move=IHanabiInfromMove(performer=0, informed_player=1,
                                                    update=HanabiColorUpdate(HanabiColor.WHITE)))

    game_state = game.get_state()
    assert all(len(card.get_informed_about()) == 0 for card in game_state.get_hand(0).get_cards())
