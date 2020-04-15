from typing import List

from hanabi_game.defs import HanabiNumber
from hanabi_game.hanabi_game_api import IHanabiState, IHanabiCard


def _is_card_exist_only_in_burnt(game_state: IHanabiState, deck_cards: List[IHanabiCard]) -> bool:
    card_hashes_in_burnt: set = set(game_state.get_burnt_pile())
    cards_not_in_burnt: List[IHanabiCard] = deck_cards + [
        game_state.get_hand(j).get_card(i)
        for j in range(game_state.get_number_of_players())
        for i in range(game_state.get_hand(j).get_amount_of_cards())]
    card_not_in_burnt_hashes = set(cards_not_in_burnt)
    return len(card_hashes_in_burnt.difference(card_not_in_burnt_hashes)) > 0


def _is_lost_by_remaining_place_turns(game_state: IHanabiState, deck_cards: List[IHanabiCard]) -> bool:
    return False


def is_lost_by_open_information(game_state: IHanabiState, deck_cards: List[IHanabiCard]) -> bool:
    return (
        _is_card_exist_only_in_burnt(game_state=game_state, deck_cards=deck_cards)
        or _is_lost_by_remaining_place_turns(game_state=game_state, deck_cards=deck_cards)
    )


def _is_lost_by_last_card_being_single_not_burnt(game_state: IHanabiState, deck_cards: List[IHanabiCard]) -> bool:
    if deck_cards[-1].get_number() is HanabiNumber.FIVE:
        return False

    return True


def is_lost_by_concealed_information(game_state: IHanabiState, deck_cards: List[IHanabiCard]) -> bool:
    return (
        _is_lost_by_last_card_being_single_not_burnt(game_state=game_state, deck_cards=deck_cards)
    )


