FECardIndex = int
HanabiGameCardIndex = int


class ICardMapper:
    def __init__(self, number_of_cards: int):
        self._number_of_cards = number_of_cards

    def get_hanabi_card_index(self, fe_card_index: FECardIndex) -> HanabiGameCardIndex:
        raise NotImplementedError("")

    def get_fe_card_index(self, hanbi_card_index: HanabiGameCardIndex) -> FECardIndex:
        raise NotImplementedError("")

    def handle_dispose(self, fe_card_index: FECardIndex) -> None:
        raise NotImplementedError("")

    def move_a_card(
        self, fe_card_initial_index: FECardIndex, fe_card_final_index: FECardIndex
    ) -> bool:
        raise NotImplementedError("")
