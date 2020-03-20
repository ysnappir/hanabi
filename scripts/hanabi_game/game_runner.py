from typing import List

from hanabi_game.defs import HanabiMoveType, InfromType, HanabiNumber
from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.hanabi_game import HanabiGame
from hanabi_game.hanabi_game_api import IHanabiState
from hanabi_game.hanabi_moves import (
    IHanabiInfromMove,
    HanabiNumberUpdate,
    IHanabiPlaceMove,
    IHanabiBurnMove,
)
from hanabi_game.utils import get_all_cards_list


def print_game_state(state: IHanabiState) -> None:
    print(state)


if __name__ == "__main__":
    states: List[IHanabiState] = []
    game = HanabiGame(
        n_players=4,
        predifined_deck=HanabiDeck(cards=get_all_cards_list()),
        starting_player=1,
    )

    states.append(game.get_state())
    print_game_state(states[-1])

    move = IHanabiInfromMove(
        performer=states[-1].get_active_player(),
        informed_player=2,
        update=HanabiNumberUpdate(number=HanabiNumber.ONE),
    )
    game.perform_move(move=move)

    states.append(game.get_state())
    print_game_state(states[-1])

    move = IHanabiPlaceMove(performer=states[-1].get_active_player(), card_hand_index=2)
    game.perform_move(move=move)

    states.append(game.get_state())
    print_game_state(states[-1])

    move = IHanabiBurnMove(performer=states[-1].get_active_player(), card_hand_index=1)
    game.perform_move(move=move)

    states.append(game.get_state())
    print_game_state(states[-1])

    move = IHanabiPlaceMove(performer=states[-1].get_active_player(), card_hand_index=3)
    game.perform_move(move=move)

    states.append(game.get_state())
    print_game_state(states[-1])
