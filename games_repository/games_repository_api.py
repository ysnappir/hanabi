from typing import Set, NamedTuple, Optional

GameIdType = int
PlayerIdType = str


class GameAction(NamedTuple):
    acting_player: PlayerIdType
    game_id: GameIdType
    action_type: str
    informed_player: Optional[PlayerIdType]
    information_data: Optional[str]
    placed_card_index: Optional[int]
    burn_card_index: Optional[int]


class GameState(NamedTuple):
    pass


class IGamesRepository:
    def get_available_id(self) -> GameIdType:
        raise NotImplementedError("")

    def create_game(self, game_id: GameIdType) -> bool:
        raise NotImplementedError("")

    def perform_action(self, action: GameAction) -> bool:
        raise NotImplementedError("")

    def get_active_games(self) -> Set[GameIdType]:
        raise NotImplementedError("")

    def get_game_state(self, game_id: GameIdType, player_id: PlayerIdType) -> GameState:
        raise NotImplementedError("")