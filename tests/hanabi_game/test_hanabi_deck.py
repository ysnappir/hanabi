from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.hanabi_game_api import IHanabiCard


ORIGINAL_HANABI_SIZE = 55


def test_hanabi_deck_size():
    deck = HanabiDeck()
    assert deck.get_size() == ORIGINAL_HANABI_SIZE


def test_hanabi_deck_take_a_card():
    deck = HanabiDeck()
    assert deck.get_size() == ORIGINAL_HANABI_SIZE

    assert isinstance(deck.take_a_card(), IHanabiCard)
    assert deck.get_size() == ORIGINAL_HANABI_SIZE - 1
