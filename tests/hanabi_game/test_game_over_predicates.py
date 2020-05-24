from typing import List

from hanabi_game.defs import HanabiNumber, HanabiColor, GameVerdict
from hanabi_game.hanabi_card import HanabiCard
from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.hanabi_game import is_lost_by_open_information, HanabiGame, is_lost_by_concealed_information
from hanabi_game.hanabi_game_api import IHanabiCard, IHanabiDeck
from hanabi_game.hanabi_moves import IHanabiPlaceMove
from hanabi_game.utils import get_all_cards_list, get_amount_of_cards_per_player, pop_from_cards_list


def test_is_card_equalization_based_only_on_content():
    assert (HanabiCard(color=HanabiColor.RAINBOW, number=HanabiNumber.TWO) ==
            HanabiCard(color=HanabiColor.RAINBOW, number=HanabiNumber.TWO))


def test_is_exist_card_only_in_burnt_pile_false_at_start():
    game_state = HanabiGame(n_players=4).get_state()
    assert is_lost_by_open_information(game_state=game_state, deck_cards=[]) is False


def test_is_exist_card_only_in_burnt_pile_false_at_start_and_not_in_table():
    n_players = 4
    cards: List[IHanabiCard] = get_all_cards_list()

    first_color = cards[0].get_color()
    cards_per_player = get_amount_of_cards_per_player(n_players)

    card_for_test = [pop_from_cards_list(cards_list=cards, color=first_color, number=HanabiNumber.TWO)
                     for _ in range(2)]

    for i in range(1, 3):
        cards.insert(i * cards_per_player, card_for_test.pop(0))

    deck = HanabiDeck(cards=cards)
    game = HanabiGame(n_players=4, predifined_deck=deck)

    for i in range(3):
        assert game.perform_move(move=IHanabiPlaceMove(performer=i, card_hand_index=0))

    assert is_lost_by_open_information(game_state=game.get_state(), deck_cards=deck.observe_cards()) is False


def test_is_exist_card_only_in_burnt_pile_true_when_five_in_burnt():
    cards: List[IHanabiCard] = get_all_cards_list()
    five_card_index = next(iter(filter(lambda i: cards[i].get_number() is HanabiNumber.FIVE, range(len(cards)))))
    cards.insert(0, cards.pop(five_card_index))
    deck = HanabiDeck(cards=cards)
    game = HanabiGame(n_players=4, predifined_deck=deck, starting_player=0)
    assert game.perform_move(move=IHanabiPlaceMove(performer=0, card_hand_index=0))
    assert is_lost_by_open_information(game_state=game.get_state(), deck_cards=deck.observe_cards()) is True


def test_is_over_by_four_rainbow_last():
    card_to_end = HanabiCard(color=HanabiColor.RAINBOW, number=HanabiNumber.FOUR)
    cards: List[IHanabiCard] = get_all_cards_list()
    four_rainbow_card = pop_from_cards_list(cards_list=cards,
                                            color=card_to_end.get_color(),
                                            number=card_to_end.get_number())
    cards.append(four_rainbow_card)
    assert cards[-1] == card_to_end
    deck = HanabiDeck(cards=cards)
    game = HanabiGame(n_players=4, predifined_deck=deck, starting_player=0)

    assert is_lost_by_concealed_information(game.get_state(), deck.observe_cards())
    assert game.get_state().get_verdict() is GameVerdict.UNWINABLE_BY_DECK


def test_is_burning_last_card_make_game_lost():
    cards: List[IHanabiCard] = get_all_cards_list()
    deck_length = len(cards)
    two_white_cards = [pop_from_cards_list(cards, HanabiColor.WHITE, number=HanabiNumber.TWO) for _ in range(2)]
    cards.insert(0, two_white_cards.pop(0))
    cards.append(two_white_cards.pop(0))
    assert len(cards) == deck_length, "reshuffling changed deck size"

    deck = HanabiDeck(cards=cards)
    game = HanabiGame(n_players=4, predifined_deck=deck, starting_player=0)

    assert (game.get_state().get_hand(0).get_cards()[0] ==
            HanabiCard(HanabiColor.WHITE, HanabiNumber.TWO)), "test preps didn't succeed"

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
    two_pairs_of_cards = {color: [pop_from_cards_list(cards, color, number=HanabiNumber.TWO)
                                  for _ in range(2)]
                          for color in [c for c in HanabiColor if c is not HanabiColor.RAINBOW][:n_players]}

    cards_per_player = get_amount_of_cards_per_player(n_players)
    for i, (color, two_cards) in enumerate(two_pairs_of_cards.items()):
        cards.insert(i * cards_per_player, two_cards.pop(0))
        cards.append(two_cards.pop(0))
        assert len(cards) > 0

    cards.append(pop_from_cards_list(cards_list=cards, color=HanabiColor.RAINBOW, number=HanabiNumber.FIVE))

    game = HanabiGame(n_players=n_players, predifined_deck=HanabiDeck(cards=cards), starting_player=0,
                      red_tokens_amount=5)

    assert game.get_state().get_verdict() is GameVerdict.ONGOING

    for i in range(n_players):
        assert game.perform_move(move=IHanabiPlaceMove(performer=i, card_hand_index=0))
        assert game.get_state().get_verdict() in [GameVerdict.ONGOING, GameVerdict.UNWINABLE_BY_DECK]

    assert game.get_state().get_verdict() is GameVerdict.UNWINABLE_BY_DECK

# def test_color_min_paths():
#     def _find_max_number_for_color(cards_list: List[IHanabiCard],
#                                    hanabi_color: HanabiColor) -> Optional[HanabiNumber]:
#         relevant = list(filter(lambda card: card.get_color() is hanabi_color, cards_list))
#         return max(map(lambda card: card.get_number(), relevant), default=None)
#
#     deck_cards = get_all_cards_list()
#     table_cards = [_pop_from_cards_list(deck_cards, HanabiColor.WHITE, HanabiNumber.ONE), ]
#
#     hand_cards = [_pop_from_cards_list(deck_cards, HanabiColor.WHITE, HanabiNumber.TWO),
#                   _pop_from_cards_list(deck_cards, HanabiColor.WHITE, HanabiNumber.FOUR)]
#
#     burnt_pile = []
#     game_state = HanabiState(deck_size=len(deck_cards),
#                              red_tokens_amount=3,
#                              blue_tokens_amount=8,
#                              hands_dict={
#                                  0: HanabiHand(initial_cards=hand_cards),
#                              },
#                              pile_tops={color: _find_max_number_for_color(cards_list=table_cards, hanabi_color=color)
#                                         for color in HanabiColor},
#                              acting_player=0,
#                              burnt_pile=burnt_pile,
#                              game_verdict=GameVerdict.ONGOING,
#                              )
#
#     min_paths = ColorMinPaths(game_state=game_state, deck_cards=deck_cards)
#     min_paths.is_lost_by_iterate_backwards()
#     assert min_paths
