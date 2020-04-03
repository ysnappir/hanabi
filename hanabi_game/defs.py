from enum import Enum


PlayerIdType = int


class InfromType(Enum):
    COLOR = "color"
    NUMBER = "number"


class HanabiNumber(Enum):
    ONE = 1
    TWO = 2
    THREE = 3
    FOUR = 4
    FIVE = 5


class HanabiColor(Enum):
    RED = "red"
    BLUE = "blue"
    GREEN = "green"
    WHITE = "white"
    YELLOW = "yellow"
    RAINBOW = "rainbow"


class HanabiMoveType(Enum):
    PLACE = "place"
    BURN = "burn"
    INFORM = "inform"


class GameVerdict(Enum):
    ONGOING = "ongoing"
    WON = "won"
    LOST = "lost"
    UNWINABLE = "unwinable"
    UNWINABLE_BY_DECK = "unwinable_by_deck"
