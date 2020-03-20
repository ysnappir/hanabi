from hanabi_game.defs import HanabiNumber
from hanabi_game.utils import get_number_to_place_on_top_of


def test_place_card_to_put_on_top_of():
    assert get_number_to_place_on_top_of(HanabiNumber.THREE) is HanabiNumber.TWO
    assert get_number_to_place_on_top_of(HanabiNumber.ONE) is None
