from typing import Dict, List, Optional

from games_repository.card_mapper_api import (
    ICardMapper,
    FECardIndex,
    HanabiGameCardIndex,
    IMapperState, ICardMapperRequest)


class MapperRequest(ICardMapperRequest):

    def __init__(self, fe_card_initial_index: FECardIndex, fe_card_final_index: Optional[FECardIndex]):
        self.fe_card_final_index = fe_card_final_index
        self.fe_card_initial_index = fe_card_initial_index


class MapperState(IMapperState):

    def __init__(self, mapping: Dict[FECardIndex, HanabiGameCardIndex], pinned_cards: int):
        self.mapping = mapping
        self.pinned_cards = pinned_cards


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

    def _handle_dispose(self, fe_card_index: FECardIndex, with_replacement: bool = True) -> bool:
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

        if not with_replacement:
            for i in range(self._pinned_cards, len(self._mapping) - 1):
                self._mapping[i] = self._mapping[i + 1]

            self._mapping.pop(len(self._mapping) - 1)

            for i in self._mapping.keys():
                if self._mapping[i] >= new_card_hanabi_index:
                    self._mapping[i] = self._mapping[i] - 1

        return True

    def _move_a_card(self, request: MapperRequest) -> bool:
        fe_card_initial_index = request.fe_card_initial_index
        fe_card_final_index = (request.fe_card_final_index if request.fe_card_final_index is not None
                               else self._pinned_cards)

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

    def get_flipped_indices(self) -> List[FECardIndex]:
        return list(range(self._pinned_cards))

    def _state_dumps(self) -> MapperState:
        return MapperState(mapping=self._mapping.copy(), pinned_cards=self._pinned_cards)

    def _state_loads(self, state: MapperState) -> bool:
        self._mapping = state.mapping
        self._pinned_cards = state.pinned_cards
        return True
