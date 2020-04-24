from typing import List, Union, Dict

from hanabi_game.defs import HanabiNumber, HanabiColor, InfromType
from hanabi_game.hanabi_game_api import IHanabiCard
from hanabi_game.hanabi_moves import IHanabiInfromMove


class HanabiCard(IHanabiCard):
    def __init__(self, color: HanabiColor, number: HanabiNumber):
        self.number = number
        self.color = color
        self.informs: List[IHanabiInfromMove] = []

    def __repr__(self) -> str:
        return f"{self.number.value} {self.color.value}"

    def get_color(self) -> HanabiColor:
        return self.color

    def get_number(self) -> HanabiNumber:
        return self.number

    def attach_inform(self, inform_move: IHanabiInfromMove) -> None:
        self.informs.append(inform_move)

    def get_informed_about(self) -> List[Dict[Union[str, int], bool]]:
        return [
            {inform.update.get_val():
             (self.color if inform.update.update_type is InfromType.COLOR else self.number) is inform.update.get_val()}
            for inform in self.informs
        ]

