import random
import time
from typing import Set, Dict, Optional, List, Callable

from games_repository.card_mapper import CardMapper, MapperRequest
from games_repository.card_mapper_api import (
    ICardMapper,
    FECardIndex,
    HanabiGameCardIndex,
)
from games_repository.defs import (
    GameStatus,
    HandsState,
    HandState,
    GameAction,
    MoveCardRequest,
    GameFactoryType, CardInfo, UndoMoveCardRequest)
from games_repository.games_repository_api import (
    IGamesRepository,
    GameIdType,
    NetworkPlayerIdType,
    GameState,
)
from hanabi_game.constants import MAXIMAL_PLAYERS, MINIMAL_PLAYERS, HANABI_DECK_SIZE, INITIAL_RED_TOKENS, \
    INITIAL_BLUE_TOKENS
from hanabi_game.defs import HanabiColor, PlayerIdType, HanabiNumber, HanabiMoveType, GameVerdict
from hanabi_game.hanabi_game import HanabiGame, HanabiState
from hanabi_game.hanabi_game_api import IHanabiGame, IHanabiState, IHanabiCard
from hanabi_game.hanabi_moves import (
    IHanabiInfromMove,
    HanabiColorUpdate,
    HanabiNumberUpdate,
    IHanabiPlaceMove,
    IHanabiBurnMove,
)


class HanabiPlayerWrapper:
    def __init__(
        self,
        network_id: NetworkPlayerIdType,
        display_name: str,
        number_of_color_in_clothes: int,
        card_mapper_factory: Callable[[int], ICardMapper] = None,
    ):
        self._display_name = display_name
        self._number_of_color_in_clothes = number_of_color_in_clothes
        self._network_id = network_id
        self._hanabi_game_id: Optional[GameIdType] = None
        self._hanabi_player_id: Optional[PlayerIdType] = None
        self._card_mapper_factory = (
            card_mapper_factory if card_mapper_factory else CardMapper
        )
        self._card_mapper: Optional[ICardMapper] = None

    def assign_to_game(self, hanabi_game_id: GameIdType) -> bool:
        if self._hanabi_game_id is not None:
            print("Player already assigned to a game!")
            return False

        self._hanabi_game_id = hanabi_game_id
        self._hanabi_player_id = None
        return True

    def set_hanabi_player_id(self, hanabi_player_id) -> None:
        self._hanabi_player_id = hanabi_player_id

    def _change_card_index(self, prev_index: int, new_index: int) -> None:
        raise NotImplementedError("")

    def get_network_player_id(self) -> NetworkPlayerIdType:
        return self._network_id

    def get_hanabi_player_id(self) -> PlayerIdType:
        return self._hanabi_player_id

    def get_game_id(self) -> GameIdType:
        return self._hanabi_game_id

    def get_number_of_cloth_colors(self) -> int:
        return self._number_of_color_in_clothes

    def get_formatted_hand_state(self, hanabi_state: IHanabiState,
                                 player_total_time: float,
                                 last_action: Optional[GameAction] = None,
                                 ) -> HandState:
        hand = hanabi_state.get_hand(self._hanabi_player_id)
        cards: Dict[FECardIndex, IHanabiCard] = {}
        flipped_indices: List[FECardIndex] = []
        if hand:
            cards = {i: hand.get_cards()[self._card_mapper.get_hanabi_card_index(fe_card_index=i)]
                     for i in range(hand.get_amount_of_cards())
                     }
            flipped_indices = self._card_mapper.get_flipped_indices()

        fe_cards = [CardInfo(
            color=card.get_color(),
            number=card.get_number(),
            is_flipped=i in flipped_indices,
            highlighted=(last_action is not None and (self._network_id == last_action.informed_player) and (
                    card.get_color().value == last_action.information_data or
                    card.get_number().value == last_action.information_data or
                    (card.get_color() is HanabiColor.RAINBOW and isinstance(last_action.information_data, str))
                    )),
            informed_values={k: v for d in card.get_informed_about() for k, v in d.items()},
            ) for i, card in cards.items()]

        return HandState(
            id=self._network_id,
            display_name=self._display_name,
            cards=fe_cards,
            total_time=player_total_time,
        )

    def initialize_hand_mapping(self, number_of_cards: int) -> None:
        self._card_mapper = self._card_mapper_factory(number_of_cards)

    def get_game_card_index(
        self, placed_card_index: FECardIndex
    ) -> HanabiGameCardIndex:
        return self._card_mapper.get_hanabi_card_index(fe_card_index=placed_card_index)

    def dispose_card(self, card_hand_index: FECardIndex, with_replacement: bool) -> None:
        self._card_mapper.handle_dispose(fe_card_index=card_hand_index, with_replacement=with_replacement)

    def move_a_card(
        self, card_initial_index: FECardIndex, card_final_index: Optional[FECardIndex]
    ) -> bool:
        return self._card_mapper.move_a_card(MapperRequest(
            fe_card_initial_index=card_initial_index,
            fe_card_final_index=card_final_index,
        ))

    def undo_move_a_card(self) -> bool:
        return self._card_mapper.undo()

    def unassign_to_game(self):
        self._hanabi_game_id = None
        self._card_mapper = None

    def undo_card_motion(self) -> bool:
        return self._card_mapper.undo()


class HanabiGameWrapper:
    def __init__(self, game_id: GameIdType, game_factory: Optional[GameFactoryType] = None):
        self._game_id = game_id
        self._game_factory = game_factory or HanabiGame
        self._status: GameStatus = GameStatus.CREATED
        self._game: Optional[IHanabiGame] = None
        self._players: Dict[NetworkPlayerIdType, HanabiPlayerWrapper] = {}
        self._ordered_players: List[NetworkPlayerIdType] = []
        self._last_successful_action: Optional[GameAction] = None
        self._last_pile_topped: Optional[HanabiColor] = None
        self._last_action_burnt: bool = False
        self._game_state: Optional[GameState] = None
        self._time_counters: Dict[NetworkPlayerIdType, float] = {}
        self._last_turn_timestamp: Optional[float] = None

    def _clear_last_action(self) -> None:
        self._last_successful_action = None
        self._last_pile_topped = None
        self._last_action_burnt = False

    def _format_hands_state(self, hanabi_state: IHanabiState) -> HandsState:
        return [
            self._players[player_id].get_formatted_hand_state(
                hanabi_state=hanabi_state,
                player_total_time=0 if not self._last_turn_timestamp else (
                    self._time_counters.get(player_id, 0) + (time.time() - self._last_turn_timestamp
                                                             if player_id == self._game_state.active_player
                                                             else 0)),
                last_action=self._last_successful_action,
                )
            for player_id in self._ordered_players]

    def get_hanabi_state(self) -> GameState:
        return self._game_state

    def get_status(self) -> GameStatus:
        return self._status

    def assign_player(self, player: HanabiPlayerWrapper) -> bool:
        if (
            len(self._players) >= MAXIMAL_PLAYERS
            or player.get_network_player_id() in self._players
        ):
            return False

        if player.assign_to_game(self._game_id):
            self._players[player.get_network_player_id()] = player
            self._ordered_players.append(player.get_network_player_id())

            self._game_state = self._get_game_state()
            return True

        return False

    def get_number_of_players(self) -> int:
        return len(self._players)

    def start(self) -> bool:
        print(f"Starting game {self._game_id}")
        # index_of_player_with_most_colors: int = max(
        #     range(self.get_number_of_players()),
        #     key=lambda i: self._players[
        #         self._ordered_players[i]
        #     ].get_number_of_cloth_colors(),
        # )
        self._game = self._game_factory(
            n_players=self.get_number_of_players(),
            starting_player=random.choice(range(self.get_number_of_players())),
        )
        hanabi_player_ids = self._game.get_players_ids()
        for network_player_id, hanabi_player_id in zip(
            self._ordered_players, hanabi_player_ids
        ):
            self._players[network_player_id].set_hanabi_player_id(
                hanabi_player_id=hanabi_player_id
            )
            self._players[network_player_id].initialize_hand_mapping(
                number_of_cards=self._game.get_cards_per_player()
            )
            self._time_counters[network_player_id] = 0

        self._status = GameStatus.ACTIVE
        self._last_turn_timestamp = time.time()

        self._game_state = self._get_game_state()
        return True

    def perform_action(self, action: GameAction) -> bool:
        try:
            action_type = HanabiMoveType(action.action_type)
        except ValueError:
            print(
                f"Unrecognized action type: {action.action_type}. Known types: {[t.value for t in HanabiMoveType]}"
            )

            return False
        disposing_index: Optional[FECardIndex] = None
        if action_type is HanabiMoveType.INFORM:
            if action.information_data in [color.value for color in HanabiColor]:
                update = HanabiColorUpdate(color=HanabiColor(action.information_data))
            elif action.information_data in [number.value for number in HanabiNumber]:
                update = HanabiNumberUpdate(
                    number=HanabiNumber(action.information_data)
                )
            else:
                print(f"Unrecognized information for update: {action.information_data}")
                return False

            move = IHanabiInfromMove(
                performer=self._players[action.acting_player].get_hanabi_player_id(),
                informed_player=self._players[
                    action.informed_player
                ].get_hanabi_player_id(),
                update=update,
            )
        elif action_type is HanabiMoveType.PLACE:
            disposing_index = action.placed_card_index
            move = IHanabiPlaceMove(
                performer=self._players[action.acting_player].get_hanabi_player_id(),
                card_hand_index=self._players[action.acting_player].get_game_card_index(
                    action.placed_card_index
                ),
            )
        elif action_type is HanabiMoveType.BURN:
            disposing_index = action.burn_card_index
            move = IHanabiBurnMove(
                performer=self._players[action.acting_player].get_hanabi_player_id(),
                card_hand_index=self._players[action.acting_player].get_game_card_index(
                    action.burn_card_index
                ),
            )
        else:
            return False

        prev_game_state = self._game.get_state()

        ret_val = self._game.perform_move(move=move)
        if ret_val:
            if action_type in [HanabiMoveType.BURN, HanabiMoveType.PLACE]:
                self._players[action.acting_player].dispose_card(
                    card_hand_index=disposing_index,
                    with_replacement=prev_game_state.get_deck_size() > 0,
                )

            self._clear_last_action()
            self._last_successful_action = action

            self._time_counters[action.acting_player] += time.time() - self._last_turn_timestamp
            self._last_turn_timestamp = time.time()

            new_game_state = self._game.get_state()

            color_pile_changed = {color for color in HanabiColor
                                  if prev_game_state.get_pile_top(color) is not new_game_state.get_pile_top(color)}
            if len(color_pile_changed) > 0:
                if len(color_pile_changed) > 1:
                    print("Warning! two piles changed together!")
                else:
                    self._last_pile_topped = next(iter(color_pile_changed))

            if len(prev_game_state.get_burnt_pile()) < len(new_game_state.get_burnt_pile()):
                self._last_action_burnt = True

            self._game_state = self._get_game_state()

        return ret_val

    def _get_game_state(self) -> GameState:
        hanabi_state: IHanabiState
        if self._status is GameStatus.CREATED:
            hanabi_state = HanabiState(
                deck_size=HANABI_DECK_SIZE,
                red_tokens_amount=INITIAL_RED_TOKENS,
                blue_tokens_amount=INITIAL_BLUE_TOKENS,
                hands_dict={},
                pile_tops={},
                burnt_pile=[],
                acting_player=max(range(len(self._ordered_players)),
                                  key=lambda i: self._players[self._ordered_players[i]].get_number_of_cloth_colors()),
                game_verdict=GameVerdict.ONGOING,
            )
        else:
            hanabi_state = self._game.get_state()

        return GameState(
            gamd_id=self._game_id,
            status=str(self._status.value),
            deck_size=hanabi_state.get_deck_size(),
            blue_token_amount=hanabi_state.get_blue_token_amount(),
            red_token_amount=hanabi_state.get_red_token_amount(),
            table_state={
                color: CardInfo(color=color, number=hanabi_state.get_pile_top(color=color), is_flipped=False,
                                highlighted=self._last_pile_topped is color)
                for color in HanabiColor
            },
            hands_state=self._format_hands_state(hanabi_state=hanabi_state),
            burnt_pile=[CardInfo(color=card.get_color(), number=card.get_number(), is_flipped=False,
                                 highlighted=self._last_action_burnt and i + 1 == len(hanabi_state.get_burnt_pile()))
                        for i, card in enumerate(hanabi_state.get_burnt_pile())],
            active_player=self._ordered_players[hanabi_state.get_active_player()],
            last_action=self._last_successful_action,
            result=hanabi_state.get_verdict(),
            timestamp=time.time()
        )

    def perform_card_motion(self, card_motion_request: MoveCardRequest) -> bool:
        if self.get_status() is not GameStatus.ACTIVE:
            return False

        try:
            ret_val = self._players[card_motion_request.player_id].move_a_card(
                card_initial_index=card_motion_request.initial_card_index,
                card_final_index=card_motion_request.final_card_index,
            )

            if ret_val:
                self._game_state = self._get_game_state()

            return ret_val
        except AssertionError:
            return False

    def get_game_id(self) -> GameIdType:
        return self._game_id

    def finish(self) -> None:
        self._status = GameStatus.FINISHED
        for player in self._players.values():
            player.unassign_to_game()

    def undo_card_motion(self, undo_card_motion_request: UndoMoveCardRequest) -> bool:
        if self.get_status() is not GameStatus.ACTIVE:
            return False

        try:
            ret_val = self._players[undo_card_motion_request.player_id].undo_card_motion()

            if ret_val:
                self._game_state = self._get_game_state()

            return ret_val
        except AssertionError:
            return False


class HanabiGamesRepository(IGamesRepository):

    def __init__(self, card_mapper_factory: Callable[[int], ICardMapper] = None):
        self._card_mapper_factory = (
            card_mapper_factory if card_mapper_factory else CardMapper
        )
        self._games: Dict[GameIdType, HanabiGameWrapper] = {}
        self._players: Dict[NetworkPlayerIdType, HanabiPlayerWrapper] = {}
        self._players_counter: int = 0
        self._games_counter: int = 0

    def _generate_player_id(self) -> NetworkPlayerIdType:
        self._players_counter += 1
        return str(self._players_counter)

    def _generate_game_id(self) -> GameIdType:
        self._games_counter += 1
        return self._games_counter

    def get_available_id(self) -> GameIdType:
        return max(self._games.keys(), default=0) + 1

    def create_game(self, game_factory: Optional[GameFactoryType] = None) -> GameIdType:
        game_id = self._generate_game_id()
        self._games[game_id] = HanabiGameWrapper(game_id=game_id, game_factory=game_factory)
        return game_id

    def get_active_games(self) -> Set[GameIdType]:
        return set(
            game_id
            for game_id, game_wrapper in self._games.items()
            if game_wrapper.get_status() is GameStatus.ACTIVE
        )

    def get_game_state(self, game_id: GameIdType) -> GameState:
        assert game_id in self._games, f"Received not existing game {game_id}"
        return self._games[game_id].get_hanabi_state()

    def register_player(
        self,
        display_name: str,
        game_id: Optional[GameIdType] = None,
        clothes_color_number: int = 1,
    ) -> NetworkPlayerIdType:
        player_id = self._generate_player_id()
        assert player_id not in self._players, f"Unknown player ({player_id})"

        self._players[player_id] = HanabiPlayerWrapper(
            network_id=player_id,
            display_name=display_name,
            number_of_color_in_clothes=clothes_color_number,
            card_mapper_factory=self._card_mapper_factory,
        )
        if game_id is not None:
            self.assign_player_to_game(player_id=player_id, game_id=game_id)

        return player_id

    def _get_players_game(
        self, player_id: NetworkPlayerIdType
    ) -> Optional[HanabiGameWrapper]:
        return self._games.get(self._players[player_id].get_game_id())

    def assign_player_to_game(
        self, player_id: NetworkPlayerIdType, game_id: GameIdType
    ) -> bool:
        if (
            game_id not in self._games
            or self._games[game_id].get_status() is not GameStatus.CREATED
            or player_id not in self._players
        ):
            if game_id not in self._games:
                print("Game not found")
            if self._games[game_id].get_status() is not GameStatus.CREATED:
                print("Game already started!")
            if player_id not in self._players:
                print("Player not found")
            return False

        players_game = self._get_players_game(player_id=player_id)
        if players_game and players_game.get_status() is not GameStatus.FINISHED:
            print("Game already started")
            return False

        return self._games[game_id].assign_player(self._players[player_id])

    def start_game(self, game_id: GameIdType) -> bool:
        if (
            game_id not in self._games
            or self._games[game_id].get_status() is not GameStatus.CREATED
        ):
            if game_id not in self._games:
                print("Game not found")
            if self._games[game_id].get_status() is not GameStatus.CREATED:
                print("Game already started!")
            return False

        if not (MAXIMAL_PLAYERS
                >= self._games[game_id].get_number_of_players()
                >= MINIMAL_PLAYERS
                ):
            print("Wrong number of players!")
            return False

        return self._games[game_id].start()

    def perform_action(self, action: GameAction) -> bool:
        if action.acting_player not in self._players:
            return False

        players_game = self._get_players_game(player_id=action.acting_player)
        if players_game is None or players_game.get_status() != GameStatus.ACTIVE:
            return False

        return players_game.perform_action(action)

    def perform_card_motion(self, card_motion_request: MoveCardRequest) -> bool:
        players_game = self._get_players_game(player_id=card_motion_request.player_id)
        if players_game is None:
            return False

        return players_game.perform_card_motion(card_motion_request=card_motion_request)

    def undo_card_motion(self, undo_card_motion_request: UndoMoveCardRequest) -> bool:
        players_game = self._get_players_game(player_id=undo_card_motion_request.player_id)
        if players_game is None:
            return False

        return players_game.undo_card_motion(undo_card_motion_request=undo_card_motion_request)

    def get_players_game(self, player_id: NetworkPlayerIdType) -> Optional[GameIdType]:
        game = self._get_players_game(player_id=player_id)
        if game is None:
            return None

        return game.get_game_id()

    def finish_game(self, game_id: GameIdType) -> bool:
        if self._games.get(game_id) is None or self._games[game_id].get_status() is not GameStatus.ACTIVE:
            print("The speciefied game is not active for finish")
            return False

        self._games[game_id].finish()
