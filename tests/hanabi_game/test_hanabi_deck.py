from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.hanabi_game_api import IHanabiCard


ORIGINAL_HANABI_SIZE = 55


def test_hanabi_deck_size():
    deck = HanabiDeck()
    assert deck.get_size() == ORIGINAL_HANABI_SIZE


def test_hanabi_deck_no_duplicates():
    deck = HanabiDeck()
    assert len(set(map(id, deck.observe_cards()))) == ORIGINAL_HANABI_SIZE


def test_hanabi_deck_take_a_card():
    deck = HanabiDeck()
    assert deck.get_size() == ORIGINAL_HANABI_SIZE

    assert isinstance(deck.take_a_card(), IHanabiCard)
    assert deck.get_size() == ORIGINAL_HANABI_SIZE - 1


def test_hanabi_dech_observe_cant_change_deck():
    deck = HanabiDeck()

    original_size = deck.get_size()
    cards = deck.observe_cards()
    cards.pop(0)
    assert deck.get_size() == original_size, "Change in observed deck view changed inner state"
