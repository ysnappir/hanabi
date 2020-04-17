from typing import List, Optional, Dict, Tuple

from hanabi_game.defs import HanabiNumber, HanabiColor
from hanabi_game.hanabi_card import HanabiCard
from hanabi_game.hanabi_game_api import IHanabiState, IHanabiCard


def _hanabi_number_to_number(hanabi_number: Optional[HanabiNumber]) -> int:
    if hanabi_number:
        return hanabi_number.value
    return 0


def _minimal_place_turns(game_state: IHanabiState) -> int:
    total_cards_to_put = len(HanabiColor.__members__) * len(HanabiNumber.__members__)

    cards_put_in_each_pile: Dict[HanabiColor, int] = {
        color: _hanabi_number_to_number(game_state.get_pile_top(color=color))
        for color in HanabiColor
    }

    cards_left_to_put = total_cards_to_put - sum(cards_put_in_each_pile.values())
    return cards_left_to_put


def _is_card_exist_only_in_burnt(game_state: IHanabiState, deck_cards: List[IHanabiCard]) -> bool:
    card_hashes_in_burnt: set = set(game_state.get_burnt_pile())
    cards_not_in_burnt: List[IHanabiCard] = deck_cards + [
        game_state.get_hand(j).get_cards()[i]
        for j in range(game_state.get_number_of_players())
        for i in range(game_state.get_hand(j).get_amount_of_cards())]
    card_not_in_burnt_hashes = set(cards_not_in_burnt)
    failure_candidates = card_hashes_in_burnt.difference(card_not_in_burnt_hashes)
    for card in list(failure_candidates):
        if (_hanabi_number_to_number(game_state.get_pile_top(card.get_color())) >=
                _hanabi_number_to_number(card.get_number())):
            failure_candidates.remove(card)

    if len(failure_candidates) > 0:
        print("Game is unwinnable. There are card exclusively in burnt pile!")
        return True
    return False


def _is_lost_by_remaining_place_turns(game_state: IHanabiState) -> bool:
    cards_left_to_put = _minimal_place_turns(game_state=game_state)
    max_place_turns = game_state.get_deck_size() + len(game_state.get_players_ids())

    if max_place_turns < cards_left_to_put:
        print("Game is unwinnable. Not enough turns left")
        return True
    return False


def is_lost_by_open_information(game_state: IHanabiState, deck_cards: List[IHanabiCard]) -> bool:
    return (
        _is_card_exist_only_in_burnt(game_state=game_state, deck_cards=deck_cards)
        or _is_lost_by_remaining_place_turns(game_state=game_state)
    )


def _is_lost_by_last_card_being_single_not_burnt(game_state: IHanabiState, deck_cards: List[IHanabiCard]) -> bool:
    last_card = deck_cards[-1]

    if last_card.get_number() is HanabiNumber.FIVE:
        return False

    if (_hanabi_number_to_number(game_state.get_pile_top(color=last_card.get_color())) >=
            _hanabi_number_to_number(last_card.get_number())):
        return False

    if hash(last_card) not in set(deck_cards[:-1] + [
        card for player_id in game_state.get_players_ids()
        for card in game_state.get_hand(player_id=player_id).get_cards()]):
        print(f"Game is unwinnable since the last card is critical and it not a 5 ({last_card})")
        return True
    return False


class ColorMinPaths:

    max_number: int = max([number.value for number in HanabiNumber], default=0)

    def __init__(self, game_state: IHanabiState, deck_cards: List[IHanabiCard]):
        self._deck_cards = deck_cards
        self._game_state = game_state
        self._cards_in_hands = set([card for player_id in game_state.get_players_ids()
                                    for card in game_state.get_hand(player_id=player_id).get_cards()])
        self._path_by_color: Dict[HanabiColor: Dict[HanabiNumber, Optional[int]]] = {color: {}
                                                                                     for color in HanabiColor}
        self._indices_by_color: Dict[int, HanabiColor] = {}
        self._find_shortest_path()

    def _find_shortest_path(self):
        for color in HanabiColor:
            for number in range(_hanabi_number_to_number(self._game_state.get_pile_top(color)) + 1,
                                ColorMinPaths.max_number + 1):
                requested_card = HanabiCard(color=color, number=HanabiNumber(number))
                if requested_card in self._cards_in_hands:
                    self._path_by_color[color][HanabiNumber(number)] = None
                else:
                    self._path_by_color[color][HanabiNumber(number)] = self._deck_cards.index(requested_card)

    def is_lost_by_iterate_backwards(self) -> bool:
        deck_iter = len(self._deck_cards)
        placements_left = len(self._game_state.get_players_ids())

        indices_by_color: List[Tuple[int, HanabiNumber, HanabiColor]] = [
            (self._path_by_color[color][number], number, color)
            for color in self._path_by_color
            for number in self._path_by_color[color]
            if self._path_by_color[color].get(number) is not None
        ]

        color_candidate: Dict[HanabiColor, Tuple[HanabiNumber, int]] = {}

        for i, number, color in sorted(indices_by_color, reverse=True):
            placements_left += deck_iter - i
            deck_iter = i

            if color not in color_candidate:
                color_candidate[color] = (number, i)
                placements_left -= ColorMinPaths.max_number - number.value
            else:
                if (color_candidate[color][0].value - number.value) >= color_candidate[color][1] - i:
                    placements_left -= (color_candidate[color][0].value - number.value)
                    color_candidate[color] = (number, i)

            if placements_left < 0:
                return True

        return False


def _is_lost_by_counting_turns_after_available_instances(game_state: IHanabiState,
                                                         deck_cards: List[IHanabiCard]) -> bool:
    min_paths = ColorMinPaths(game_state=game_state, deck_cards=deck_cards)
    if min_paths.is_lost_by_iterate_backwards():
        print("Game is unwinnable since there are to many low critical low cards in the end of the pile")
        return True
    return False


def is_lost_by_concealed_information(game_state: IHanabiState, deck_cards: List[IHanabiCard]) -> bool:
    return (
        _is_lost_by_last_card_being_single_not_burnt(game_state=game_state, deck_cards=deck_cards)
        or _is_lost_by_counting_turns_after_available_instances(game_state=game_state, deck_cards=deck_cards)
    )


