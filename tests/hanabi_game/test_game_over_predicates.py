from typing import List

from hanabi_game.defs import HanabiNumber, HanabiColor
from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.hanabi_game import is_exist_card_only_in_burnt_pile, HanabiGame, is_lost_by_deck_ordering
from hanabi_game.hanabi_game_api import IHanabiCard
from hanabi_game.hanabi_moves import IHanabiPlaceMove
from hanabi_game.utils import get_all_cards_list


def test_is_exist_card_only_in_burnt_pile_false_at_start():
    game_state = HanabiGame(n_players=4).get_state()
    assert is_exist_card_only_in_burnt_pile(game_state=game_state, deck_cards=[]) is False


def test_is_exist_card_only_in_burnt_pile_true_when_five_in_burnt():
    cards: List[IHanabiCard] = get_all_cards_list()
    five_card_index = next(iter(filter(lambda i: cards[i].get_number() is HanabiNumber.FIVE, range(len(cards)))))
    cards.insert(0, cards.pop(five_card_index))
    deck = HanabiDeck(cards=cards)
    game = HanabiGame(n_players=4, predifined_deck=deck, starting_player=0)
    assert game.perform_move(move=IHanabiPlaceMove(performer=0, card_hand_index=0))
    assert is_exist_card_only_in_burnt_pile(game_state=game.get_state(), deck_cards=deck.observe_cards()) is True

#
# def test_is_over_by_four_rainbow_last():
#     cards: List[IHanabiCard] = get_all_cards_list()
#     four_rainbow_index = next(iter(filter(
#         lambda i: cards[i].get_number() is HanabiNumber.FOUR and cards[i].get_color() is HanabiColor.RAINBOW,
#         range(len(cards)))))
#     cards.insert(-1, cards.pop(four_rainbow_index))
#     deck = HanabiDeck(cards=cards)
#     game = HanabiGame(n_players=4, predifined_deck=deck, starting_player=0)
#     assert is_lost_by_deck_ordering(game.get_state(), deck.observe_cards())
