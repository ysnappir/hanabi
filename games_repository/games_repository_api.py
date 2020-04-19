from typing import Set, Optional

from games_repository.defs import (
    GameIdType,
    GameAction,
    NetworkPlayerIdType,
    GameState,
    MoveCardRequest,
    GameFactoryType, UndoMoveCardRequest)


class IGamesRepository:

    def create_game(self, game_factory: Optional[GameFactoryType] = None) -> GameIdType:
        raise NotImplementedError("")

    def start_game(self, game_id: GameIdType) -> bool:
        raise NotImplementedError("")

    def perform_action(self, action: GameAction) -> bool:
        raise NotImplementedError("")

    def perform_card_motion(self, card_motion_request: MoveCardRequest) -> bool:
        raise NotImplementedError("")

    def undo_card_motion(self, undo_card_motion_request: UndoMoveCardRequest) -> bool:
        raise NotImplementedError("")

    def get_active_games(self) -> Set[GameIdType]:
        raise NotImplementedError("")

    def get_game_state(self, game_id: GameIdType) -> GameState:
        raise NotImplementedError("")

    def get_players_game(self, player_id: NetworkPlayerIdType) -> Optional[GameIdType]:
        raise NotImplementedError("")

    def register_player(
        self,
        display_name: str,
        game_id: Optional[GameIdType] = None,
        clothes_color_number: int = 1,
    ) -> bool:
        raise NotImplementedError("")

    def assign_player_to_game(
        self, player_id: NetworkPlayerIdType, game_id: GameIdType
    ) -> bool:
        raise NotImplementedError("")

    def finish_game(self, game_id: GameIdType) -> bool:
        raise NotImplementedError("")
