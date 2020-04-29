from typing import List

from hanabi_game.defs import HanabiNumber, HanabiColor
from hanabi_game.hanabi_card import HanabiCard
from hanabi_game.hanabi_game_api import IHanabiCard
from hanabi_game.utils import get_number_to_place_on_top_of


def test_place_card_to_put_on_top_of():
    assert get_number_to_place_on_top_of(HanabiNumber.THREE) is HanabiNumber.TWO
    assert get_number_to_place_on_top_of(HanabiNumber.ONE) is None


def pop_from_cards_list(cards_list: List[IHanabiCard], color: HanabiColor, number: HanabiNumber) -> IHanabiCard:
    requested_card = HanabiCard(color=color, number=number)
    card_index = next(iter(filter(
        lambda i: cards_list[i] == requested_card,
        range(len(cards_list)))))
    return cards_list.pop(card_index)
