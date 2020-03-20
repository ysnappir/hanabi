from typing import NamedTuple

from hanabi_game.defs import (
    HanabiMoveType,
    PlayerIdType,
    InfromType,
    HanabiColor,
    HanabiNumber,
)


class IHanabiMove(NamedTuple):
    type: HanabiMoveType


class HanabiPlaceMove(IHanabiMove):
    placer: PlayerIdType
    card_hand_index: int


class HanabiBurnMove(IHanabiMove):
    burner: PlayerIdType
    card_hand_index: int


class HanabiUpdate:
    type: InfromType


class HanabiColorUpdate(HanabiUpdate):
    color: HanabiColor


class HanabiNumberUpdate(HanabiUpdate):
    number: HanabiNumber


class HanabiInfromMove(IHanabiMove):
    informer: PlayerIdType
    informee: PlayerIdType
    update: HanabiUpdate
