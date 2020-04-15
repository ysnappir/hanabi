from typing import List

from hanabi_game.defs import HanabiNumber, HanabiColor, GameVerdict
from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.hanabi_game import is_lost_by_open_information, HanabiGame, is_lost_by_concealed_information
from hanabi_game.hanabi_game_api import IHanabiCard, IHanabiDeck
from hanabi_game.hanabi_moves import IHanabiPlaceMove
from hanabi_game.utils import get_all_cards_list, get_amount_of_cards_per_player


def _pop_from_cards_list(cards_list: List[IHanabiCard], color: HanabiColor, number: HanabiNumber) -> IHanabiCard:
    card_index = next(iter(filter(
        lambda i: cards_list[i].get_number() is number and cards_list[i].get_color() is color,
        range(len(cards_list)))))
    return cards_list.pop(card_index)


def test_is_exist_card_only_in_burnt_pile_false_at_start():
    game_state = HanabiGame(n_players=4).get_state()
    assert is_lost_by_open_information(game_state=game_state, deck_cards=[]) is False


def test_is_exist_card_only_in_burnt_pile_true_when_five_in_burnt():
    cards: List[IHanabiCard] = get_all_cards_list()
    five_card_index = next(iter(filter(lambda i: cards[i].get_number() is HanabiNumber.FIVE, range(len(cards)))))
    cards.insert(0, cards.pop(five_card_index))
    deck = HanabiDeck(cards=cards)
    game = HanabiGame(n_players=4, predifined_deck=deck, starting_player=0)
    assert game.perform_move(move=IHanabiPlaceMove(performer=0, card_hand_index=0))
    assert is_lost_by_open_information(game_state=game.get_state(), deck_cards=deck.observe_cards()) is True


def test_is_over_by_four_rainbow_last():
    cards: List[IHanabiCard] = get_all_cards_list()
    four_rainbow_card = _pop_from_cards_list(cards, HanabiColor.RAINBOW, number=HanabiNumber.FOUR)
    cards.insert(-1, four_rainbow_card)
    deck = HanabiDeck(cards=cards)
    game = HanabiGame(n_players=4, predifined_deck=deck, starting_player=0)

    assert is_lost_by_concealed_information(game.get_state(), deck.observe_cards())
    assert game.get_state().get_verdict() is GameVerdict.UNWINABLE_BY_DECK


def test_is_burning_last_card_make_game_lost():
    cards: List[IHanabiCard] = get_all_cards_list()
    deck_length = len(cards)
    two_white_cards = [_pop_from_cards_list(cards, HanabiColor.WHITE, number=HanabiNumber.TWO) for _ in range(2)]
    cards.insert(0, two_white_cards.pop(0))
    cards.insert(-1, two_white_cards.pop(0))
    assert len(cards) == deck_length, "reshuffling changed deck size"

    deck = HanabiDeck(cards=cards)
    game = HanabiGame(n_players=4, predifined_deck=deck, starting_player=0)

    assert (game.get_state().get_hand(0).get_card(0).get_number() is HanabiNumber.TWO,
            game.get_state().get_hand(0).get_card(0).get_color() is HanabiColor.WHITE), "test preps didn't succeed"

    assert game.perform_move(move=IHanabiPlaceMove(performer=0, card_hand_index=0))

    assert is_lost_by_concealed_information(game.get_state(), deck.observe_cards())
    assert game.get_state().get_verdict() is GameVerdict.UNWINABLE_BY_DECK


def test_not_enough_place_moves_left():
    n_players = 4
    cards_to_put_at_start = len(HanabiColor.__members__) * len(HanabiNumber.__members__)

    deck: IHanabiDeck = HanabiDeck(get_all_cards_list()[:cards_to_put_at_start])

    game = HanabiGame(n_players=n_players, predifined_deck=deck, starting_player=0)

    assert game.get_state().get_verdict() is GameVerdict.UNWINABLE


def test_not_enough_turns_because_many_twos_at_end():
    n_players = 4
    cards: List[IHanabiCard] = get_all_cards_list()
    two_pairs_of_cards = {color: [_pop_from_cards_list(cards, HanabiColor.WHITE, number=HanabiNumber.TWO)
                                  for _ in range(2)]
                          for color in [c for c in HanabiColor if c is not HanabiColor.RAINBOW][:n_players]}

    cards_per_player = get_amount_of_cards_per_player(n_players)
    for i, (color, cards) in enumerate(two_pairs_of_cards.items()):
        cards.insert(i * cards_per_player, cards.pop(0))
        cards.insert(-1, cards.pop(0))
        assert len(cards) > 0

    game = HanabiGame(n_players=n_players, predifined_deck=HanabiDeck(cards=cards), starting_player=0)

    for i in range(n_players):
        assert game.perform_move(move=IHanabiPlaceMove(performer=i, card_hand_index=0))

    assert game.get_state().get_verdict() is GameVerdict.UNWINABLE_BY_DECK
