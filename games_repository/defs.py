from enum import Enum
from typing import NamedTuple, Optional, Dict, List

from games_repository.card_mapper_api import FECardIndex
from hanabi_game.defs import HanabiColor, HanabiNumber
from hanabi_game.hanabi_game_api import IHanabiCard

GameIdType = int
NetworkPlayerIdType = str
TableState = Dict[HanabiColor, Optional[HanabiNumber]]


class HandState(NamedTuple):
    id: NetworkPlayerIdType
    display_name: str
    cards: List[IHanabiCard]


HandsState = List[HandState]


class GameAction(NamedTuple):
    acting_player: NetworkPlayerIdType
    action_type: str
    informed_player: Optional[NetworkPlayerIdType]
    information_data: Optional[str]
    placed_card_index: Optional[int]
    burn_card_index: Optional[int]


class GameState(NamedTuple):
    deck_size: int
    blue_token_amount: int
    red_token_amount: int
    table_state: TableState
    hands_state: HandsState
    burnt_pile: List[IHanabiCard]


class MoveCardRequest(NamedTuple):
    player_id: NetworkPlayerIdType
    initial_card_index: FECardIndex
    final_card_index: FECardIndex


class GameStatus(Enum):
    CREATED = "created"
    ACTIVE = "active"
    FINISHED = "finished"
