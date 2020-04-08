from typing import Dict

from games_repository.card_mapper_api import (
    ICardMapper,
    FECardIndex,
    HanabiGameCardIndex,
)


class CardMapper(ICardMapper):
    def __init__(self, number_of_cards: int):
        super().__init__(number_of_cards=number_of_cards)
        self._mapping: Dict[FECardIndex, HanabiGameCardIndex] = {
            i: i for i in range(number_of_cards)
        }
        self._pinned_cards: int = 0

    def get_hanabi_card_index(self, fe_card_index: FECardIndex) -> HanabiGameCardIndex:
        return self._mapping[fe_card_index]

    def get_fe_card_index(self, hanbi_card_index: HanabiGameCardIndex) -> FECardIndex:
        return next(iter(k for k, v in self._mapping.items() if v == hanbi_card_index))

    def handle_dispose(self, fe_card_index: FECardIndex) -> None:
        new_card_hanabi_index = self._mapping[fe_card_index]

        if fe_card_index >= self._pinned_cards:
            for fe_index_iter in range(fe_card_index, self._pinned_cards, -1):
                self._mapping[fe_index_iter] = self._mapping[fe_index_iter - 1]

            self._mapping[self._pinned_cards] = new_card_hanabi_index
        else:
            self._pinned_cards -= 1
            for fe_index_iter in range(fe_card_index, self._pinned_cards):
                self._mapping[fe_index_iter] = self._mapping[fe_index_iter + 1]

            self._mapping[self._pinned_cards] = new_card_hanabi_index

    def move_a_card(
        self, fe_card_initial_index: FECardIndex, fe_card_final_index: FECardIndex
    ) -> bool:
        if fe_card_final_index > self._pinned_cards:
            return False

        if fe_card_initial_index >= self._pinned_cards:
            self._pinned_cards += 1

        assert fe_card_initial_index >= fe_card_final_index

        game_card_index = self._mapping[fe_card_initial_index]
        step = 1 if fe_card_initial_index < fe_card_final_index else -1
        for fe_card_index in range(fe_card_initial_index, fe_card_final_index, step):
            self._mapping[fe_card_index] = self._mapping[fe_card_index + step]

        self._mapping[fe_card_final_index] = game_card_index
        return True
