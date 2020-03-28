from typing import List, Optional, Dict, Callable, Hashable

from hanabi_game.constants import INITIAL_BLUE_TOKENS, INITIAL_RED_TOKENS
from hanabi_game.defs import PlayerIdType, HanabiColor, HanabiNumber, HanabiMoveType, GameVerdict
from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.hanabi_game_api import (
    IHanabiGame,
    IHanabiState,
    IHandType,
    IHanabiDeck,
    IHanabiCard,
)
from hanabi_game.hanabi_moves import (
    IHanabiMove,
    IHanabiInfromMove,
    IHanabiBurnMove,
    IHanabiPlaceMove,
)
from hanabi_game.utils import (
    get_amount_of_cards_per_player,
    get_number_to_place_on_top_of,
)


class HanabiState(IHanabiState):
    def __init__(
        self,
        deck_size: int,
        red_tokens_amount: int,
        blue_tokens_amount: int,
        hands_dict: Dict[PlayerIdType, IHandType],
        pile_tops: Dict[HanabiColor, Optional[HanabiNumber]],
        acting_player: PlayerIdType,
        burnt_pile: List[IHanabiCard],
    ):
        self._pile_tops = pile_tops
        self._hands = hands_dict
        self._player_ids = list(self._hands.keys())
        self._n_players = len(self._player_ids)
        self._blue_tokens_amount = blue_tokens_amount
        self._red_tokens_amount = red_tokens_amount
        self._deck_size = deck_size
        self._acting_player = acting_player
        self._burnt_pile = burnt_pile

    def _player_repr(self, player_id: PlayerIdType) -> str:
        sign = "-> "
        return (
            f"{sign if  player_id == self._acting_player else ' ' * len(sign)} [{player_id}]   "
            f"{self._hands[player_id]}"
        )

    def _table_repr(self) -> str:
        return str(
            {
                str(color.value).upper(): self._pile_tops[color].value
                if color in self._pile_tops
                else 0
                for color in HanabiColor
            }
        )

    def __repr__(self) -> str:
        return (
            f"""
        Tokens: Blue {self._blue_tokens_amount}, Red {self._red_tokens_amount}
        
        Deck has {self._deck_size} cards
        
        Table: {self._table_repr()}
        
        \n"""
            + "\n".join(
                [
                    self._player_repr(player_id=player_id)
                    for player_id in self._hands.keys()
                ]
            )
            + "\n"
            + ("=" * 50)
        )

    def get_pile_top(self, color: HanabiColor) -> Optional[HanabiNumber]:
        return self._pile_tops.get(color)

    def get_number_of_players(self) -> int:
        return self._n_players

    def get_players_ids(self) -> List[PlayerIdType]:
        return self._player_ids

    def get_hand(self, player_id: PlayerIdType) -> IHandType:
        return self._hands.get(player_id)

    def get_blue_token_amount(self) -> int:
        return self._blue_tokens_amount

    def get_red_token_amount(self) -> int:
        return self._red_tokens_amount

    def get_deck_size(self) -> int:
        return self._deck_size

    def get_active_player(self) -> PlayerIdType:
        return self._acting_player

    def get_burnt_pile(self) -> List[IHanabiCard]:
        return self._burnt_pile


class HanabiHand(IHandType):
    def __init__(self, initial_cards: Optional[List[IHanabiCard]]):
        self._cards = initial_cards if initial_cards else []

    def get_amount_of_cards(self) -> int:
        return len(self._cards)

    def get_card(self, index: int) -> IHanabiCard:
        return self._cards[index]

    def pop_card(self, index: int) -> IHanabiCard:
        return self._cards.pop(index)

    def add_card(self, card: IHanabiCard, index: int) -> None:
        self._cards = self._cards[:index] + [card] + self._cards[index:]


def _card_to_hashable(card: IHanabiCard) -> Hashable:
    return tuple((card.get_number().value, card.get_color().value))


def is_exist_card_only_in_burnt_pile(game_state: IHanabiState, deck_cards: List[IHanabiCard]) -> bool:
    card_hashes_in_burnt: set = set(map(_card_to_hashable, game_state.get_burnt_pile()))
    cards_not_in_burnt: List[IHanabiCard] = deck_cards + [
        game_state.get_hand(j).get_card(i)
        for j in range(game_state.get_number_of_players())
        for i in range(game_state.get_hand(j).get_amount_of_cards())]
    card_not_in_burnt_hashes = set(map(_card_to_hashable, cards_not_in_burnt))
    return len(card_hashes_in_burnt.difference(card_not_in_burnt_hashes)) > 0


class HanabiGame(IHanabiGame):

    def is_lost_by_deck_ordering(game_state: IHanabiState, deck_cards: List[IHanabiCard]) -> bool:
        raise NotImplementedError("")

    def __init__(
        self,
        n_players: int,
        predifined_deck: IHanabiDeck = None,
        starting_player: PlayerIdType = None,
    ):
        self._blue_tokens_amount: int = INITIAL_BLUE_TOKENS
        self._red_tokens_amount: int = INITIAL_RED_TOKENS
        self._n_players = n_players
        self._acting_player: PlayerIdType = 0 if starting_player is None else starting_player
        self._number_of_cards_per_player = get_amount_of_cards_per_player(
            self._n_players
        )
        self._deck: IHanabiDeck = HanabiDeck() if predifined_deck is None else predifined_deck
        self._burnt_pile: List[IHanabiCard] = []
        self._players_ids: List[PlayerIdType] = list(range(self._n_players))
        self._piles: Dict[HanabiColor, Optional[HanabiNumber]] = {}
        self._players_hands: Dict[PlayerIdType, IHandType] = {
            player_id: HanabiHand(
                initial_cards=[
                    self._deck.take_a_card()
                    for _ in range(self._number_of_cards_per_player)
                ]
            )
            for player_id in self._players_ids
        }
        self._is_legal: Dict[HanabiMoveType, Callable[[type(IHanabiMove)], bool]] = {
            HanabiMoveType.BURN: self._is_legal_burn,
            HanabiMoveType.PLACE: self._is_legal_place,
            HanabiMoveType.INFORM: self._is_legal_inform,
        }
        self._perform_move: Dict[
            HanabiMoveType, Callable[[type(IHanabiMove)], None]
        ] = {
            HanabiMoveType.BURN: self._perform_burn,
            HanabiMoveType.PLACE: self._perform_place,
            HanabiMoveType.INFORM: self._perform_inform,
        }
        self._game_verdict: GameVerdict = GameVerdict.ONGOING
        self._moves_log = []

    def last_move(self) -> Optional[IHanabiMove]:
        if len(self._moves_log) == 0:
            return None
        return self._moves_log[-1]

    def perform_move(self, move: IHanabiMove) -> bool:
        if not self._is_legal_move(move):
            return False

        self._moves_log.append(move)
        self._perform_move[move.move_type](move)
        self._pass_the_turn()
        return True

    def _perform_burn(self, move: IHanabiBurnMove) -> None:
        self._burnt_pile.append(
            self._players_hands[move.performer].pop_card(move.card_hand_index)
        )
        if self._deck.get_size() > 0:
            self._players_hands[move.performer].add_card(
                card=self._deck.take_a_card(), index=move.card_hand_index
            )

        self._blue_tokens_amount += 1
        # TODO 20/03/2020 ysnappir: Consider check if game is over

    def _perform_place(self, move: IHanabiPlaceMove) -> None:
        placed_card = self._players_hands[move.performer].pop_card(move.card_hand_index)
        if self._deck.get_size() > 0:
            self._players_hands[move.performer].add_card(
                card=self._deck.take_a_card(), index=move.card_hand_index
            )

        required_top = get_number_to_place_on_top_of(placed_card.get_number())
        if self._piles.get(placed_card.get_color()) is required_top:
            self._piles[placed_card.get_color()] = placed_card.get_number()
            if placed_card.get_number() is HanabiNumber.FIVE:
                self._blue_tokens_amount += 1
                if all(self._piles.get(color) is HanabiNumber.FIVE for color in HanabiColor):
                    self._game_verdict = GameVerdict.WON
        else:
            self._burnt_pile.append(placed_card)
            self._red_tokens_amount -= 1
            if self._red_tokens_amount == 0:
                self._game_verdict = GameVerdict.LOST

    def _perform_inform(self, move: IHanabiInfromMove) -> None:
        self._blue_tokens_amount -= 1

    def _is_legal_move(self, move: IHanabiMove) -> bool:
        if self._acting_player != move.performer:
            return False

        return self._is_legal[move.move_type](move)

    def _is_legal_burn(self, move: IHanabiBurnMove) -> bool:
        return (
            self._blue_tokens_amount < INITIAL_BLUE_TOKENS
            and move.card_hand_index
            < self._players_hands[move.performer].get_amount_of_cards()
        )

    def _is_legal_place(self, move: IHanabiPlaceMove) -> bool:
        return (
            move.card_hand_index
            < self._players_hands[move.performer].get_amount_of_cards()
        )

    def _is_legal_inform(self, move: IHanabiInfromMove) -> bool:
        return self._blue_tokens_amount > 0 and move.informed_player != move.performer

    def _pass_the_turn(self):
        self._acting_player = (self._acting_player + 1) % self._n_players

    def get_state(self) -> IHanabiState:
        return HanabiState(
            deck_size=self._deck.get_size(),
            red_tokens_amount=self._red_tokens_amount,
            blue_tokens_amount=self._blue_tokens_amount,
            hands_dict=self._players_hands,
            pile_tops=self._piles,
            acting_player=self._acting_player,
            burnt_pile=self._burnt_pile,
        )

    def get_players_ids(self) -> List[PlayerIdType]:
        return self._players_ids

    def get_cards_per_player(self) -> int:
        return self._number_of_cards_per_player

    def _is_game_winable(self) -> bool:
        raise NotImplementedError("")

    def get_verdict(self) -> GameVerdict:
        if self._game_verdict in [GameVerdict.LOST, GameVerdict.WON]:
            return self._game_verdict

        if is_exist_card_only_in_burnt_pile(self.get_state(), self._deck.observe_cards()):
            self._game_verdict = GameVerdict.UNWINABLE
            return self._game_verdict

        # if is_lost_by_deck_ordering(self.get_state(), self._deck.observe_cards()):
        #     self._game_verdict = GameVerdict.UNWINABLE_BY_DECK
        #     return self._game_verdict

        return self._game_verdict
