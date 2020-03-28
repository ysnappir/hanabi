import random
from typing import List
from hanabi_game.hanabi_game_api import IHanabiDeck, IHanabiCard
from hanabi_game.utils import get_all_cards_list


def _create_random_card_deck() -> List[IHanabiCard]:
    all_cards_list = get_all_cards_list()
    random.shuffle(all_cards_list)
    return all_cards_list


class HanabiDeck(IHanabiDeck):
    def __init__(self, cards: List[IHanabiCard] = None):
        self._cards = _create_random_card_deck() if cards is None else cards

    def take_a_card(self) -> IHanabiCard:
        return self._cards.pop(0)

    def get_size(self) -> int:
        return len(self._cards)

    def observe_cards(self) -> List[IHanabiCard]:
        return self._cards[:]
