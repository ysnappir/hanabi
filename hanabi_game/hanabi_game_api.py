from typing import Optional, List

from hanabi_game.defs import HanabiColor, HanabiNumber, PlayerIdType
from hanabi_game.hanabi_moves import IHanabiMove


class IHanabiCard:
    def get_color(self) -> HanabiColor:
        raise NotImplementedError("")

    def get_number(self) -> HanabiNumber:
        raise NotImplementedError("")


class IHandType:
    def __repr__(self):
        return ", ".join(
            str(self.get_card(i)) for i in range(self.get_amount_of_cards())
        )

    def get_amount_of_cards(self) -> int:
        raise NotImplementedError("")

    def get_card(self, index: int) -> IHanabiCard:
        raise NotImplementedError("")

    def pop_card(self, index: int) -> IHanabiCard:
        raise NotImplementedError("")

    def add_card(self, card: IHanabiCard, index: int) -> None:
        raise NotImplementedError("")


class IHanabiState:
    def get_active_player(self) -> PlayerIdType:
        raise NotImplementedError("")

    def get_pile_top(self, color: HanabiColor) -> Optional[HanabiNumber]:
        raise NotImplementedError("")

    def get_number_of_players(self) -> int:
        raise NotImplementedError("")

    def get_players_ids(self) -> List[PlayerIdType]:
        raise NotImplementedError("")

    def get_hand(self, player_id: PlayerIdType) -> IHandType:
        raise NotImplementedError("")

    def get_blue_token_amount(self) -> int:
        raise NotImplementedError("")

    def get_red_token_amount(self) -> int:
        raise NotImplementedError("")

    def get_deck_size(self) -> int:
        raise NotImplementedError("")

    def get_burnt_pile(self) -> List[IHanabiCard]:
        raise NotImplementedError("")


class IHanabiDeck:
    def take_a_card(self) -> IHanabiCard:
        raise NotImplementedError("")

    def get_size(self) -> int:
        raise NotImplementedError("")


class IHanabiGame:
    def perform_move(self, move: IHanabiMove) -> bool:
        raise NotImplementedError("")

    def get_state(self) -> IHanabiState:
        raise NotImplementedError("")

    def get_players_ids(self) -> List[PlayerIdType]:
        raise NotImplementedError("")

    def get_cards_per_player(self) -> int:
        raise NotImplementedError("")
