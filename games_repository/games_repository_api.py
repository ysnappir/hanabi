from typing import Set, Optional

from games_repository.defs import (
    GameIdType,
    GameAction,
    NetworkPlayerIdType,
    GameState,
    MoveCardRequest,
)


class IGamesRepository:
    def get_available_id(self) -> GameIdType:
        raise NotImplementedError("")

    def create_game(self, game_id: GameIdType) -> bool:
        raise NotImplementedError("")

    def start_game(self, game_id: GameIdType) -> bool:
        raise NotImplementedError("")

    def perform_action(self, action: GameAction) -> bool:
        raise NotImplementedError("")

    def perform_card_motion(self, card_motion_request: MoveCardRequest) -> bool:
        raise NotImplementedError("")

    def get_active_games(self) -> Set[GameIdType]:
        raise NotImplementedError("")

    def get_game_state(
        self, game_id: GameIdType, player_id: NetworkPlayerIdType
    ) -> GameState:
        raise NotImplementedError("")

    def register_player(
        self,
        player_id: NetworkPlayerIdType,
        display_name: str,
        game_id: Optional[GameIdType] = None,
        clothes_color_number: int = 1,
    ) -> bool:
        raise NotImplementedError("")

    def assign_player_to_game(
        self, player_id: NetworkPlayerIdType, game_id: GameIdType
    ) -> bool:
        raise NotImplementedError("")
