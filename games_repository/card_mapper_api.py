from typing import List

FECardIndex = int
HanabiGameCardIndex = int


class ICardMapperRequest:
    pass


class IMapperState:
    pass


class ICardMapper:
    def __init__(self, number_of_cards: int):
        self._number_of_cards = number_of_cards
        self._state_log: List[IMapperState] = []

    def get_hanabi_card_index(self, fe_card_index: FECardIndex) -> HanabiGameCardIndex:
        raise NotImplementedError("")

    def get_fe_card_index(self, hanbi_card_index: HanabiGameCardIndex) -> FECardIndex:
        raise NotImplementedError("")

    def _handle_dispose(self, fe_card_index: FECardIndex, with_replacement: bool = True) -> bool:
        raise NotImplementedError("")

    def handle_dispose(self, fe_card_index: FECardIndex, with_replacement: bool = True) -> bool:
        if self._handle_dispose(fe_card_index=fe_card_index, with_replacement=with_replacement):
            self._state_log = []
            return True

        return False

    def _move_a_card(
        self, request: ICardMapperRequest,
    ) -> bool:
        raise NotImplementedError("")

    def move_a_card(
        self, request: ICardMapperRequest
    ) -> bool:
        current_state = self._state_dumps()

        if self._move_a_card(request=request):
            self._state_log.append(current_state)
            return True

        return False

    def get_flipped_indices(self) -> List[FECardIndex]:
        return []

    def _state_dumps(self) -> IMapperState:
        raise AssertionError("")

    def _state_loads(self, state: IMapperState) -> bool:
        raise AssertionError("")

    def undo(self) -> bool:
        if len(self._state_log) == 0:
            return False

        return self._state_loads(state=self._state_log.pop(-1))
