from hanabi_game.defs import HanabiNumber, HanabiColor
from hanabi_game.hanabi_game_api import IHanabiCard


class HanabiCard(IHanabiCard):
    def __init__(self, color: HanabiColor, number: HanabiNumber):
        self.number = number
        self.color = color

    def __repr__(self) -> str:
        return f"{self.number.value} {self.color.value}"

    def get_color(self) -> HanabiColor:
        return self.color

    def get_number(self) -> HanabiNumber:
        return self.number
