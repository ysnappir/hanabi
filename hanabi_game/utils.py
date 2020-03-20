from itertools import chain
from typing import Optional, List

from hanabi_game.defs import HanabiNumber, HanabiColor
from hanabi_game.hanabi_card import HanabiCard
from hanabi_game.hanabi_game_api import IHanabiCard


def get_amount_of_cards_per_player(n_players: int) -> int:
    if n_players in [2, 3]:
        return 5
    elif n_players in [4, 5]:
        return 4
    raise AssertionError(f"Hanabi is for 2-5 players ({n_players} given)")


def get_number_to_place_on_top_of(new_card: HanabiNumber) -> Optional[HanabiNumber]:
    if new_card.value == 1:
        return None
    return HanabiNumber(new_card.value - 1)


def get_all_cards_list() -> List[IHanabiCard]:
    amount_by_color_and_number = {
        color: {
            HanabiNumber.ONE: 3,
            HanabiNumber.TWO: 2,
            HanabiNumber.THREE: 2,
            HanabiNumber.FOUR: 2,
            HanabiNumber.FIVE: 1,
        }
        for color in HanabiColor
        if color is not HanabiColor.RAINBOW
    }
    amount_by_color_and_number.update(
        {HanabiColor.RAINBOW: {number: 1 for number in HanabiNumber}}
    )
    cards_lists = [
        [HanabiCard(color=color, number=number)] * amount
        for color in amount_by_color_and_number
        for number, amount in amount_by_color_and_number[color].items()
    ]
    return list(chain(*cards_lists))
