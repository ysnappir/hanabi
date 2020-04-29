from typing import Union

from hanabi_game.defs import (
    HanabiMoveType,
    PlayerIdType,
    InfromType,
    HanabiColor,
    HanabiNumber,
)


class IHanabiMove:
    def __init__(self, move_type: HanabiMoveType, performer: PlayerIdType):
        self.move_type = move_type
        self.performer = performer


class IHanabiPlaceMove(IHanabiMove):
    def __init__(self, performer: PlayerIdType, card_hand_index: int):
        super().__init__(move_type=HanabiMoveType.PLACE, performer=performer)
        self.card_hand_index = card_hand_index


class IHanabiBurnMove(IHanabiMove):
    def __init__(self, performer: PlayerIdType, card_hand_index: int):
        super().__init__(move_type=HanabiMoveType.BURN, performer=performer)
        self.card_hand_index = card_hand_index


class HanabiUpdate:
    def __init__(self, update_type: InfromType):
        self.update_type = update_type

    def get_val(self) -> Union[HanabiColor, HanabiNumber]:
        raise NotImplementedError("")


class HanabiColorUpdate(HanabiUpdate):
    def __init__(self, color: HanabiColor):
        super().__init__(update_type=InfromType.COLOR)
        self.color = color

    def get_val(self) -> HanabiColor:
        return self.color


class HanabiNumberUpdate(HanabiUpdate):
    def __init__(self, number: HanabiNumber):
        super().__init__(update_type=InfromType.NUMBER)
        self.number = number

    def get_val(self) -> HanabiNumber:
        return self.number


class IHanabiInfromMove(IHanabiMove):
    def __init__(
        self,
        performer: PlayerIdType,
        informed_player: PlayerIdType,
        update: HanabiUpdate,
    ):
        super().__init__(move_type=HanabiMoveType.INFORM, performer=performer)
        self.update = update
        self.informed_player = informed_player
