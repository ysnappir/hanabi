from games_repository.card_mapper import CardMapper, MapperRequest
from games_repository.card_mapper_api import ICardMapper
from games_repository.defs import GameAction, MoveCardRequest
from games_repository.game_repository import HanabiGamesRepository
from games_repository.utils import deck_to_game_factory
from hanabi_game.hanabi_deck import HanabiDeck
from hanabi_game.utils import get_all_cards_list


def test_correct_mapping_after_moving():
    mapper: ICardMapper = CardMapper(5)

    mapper.move_a_card(MapperRequest(3, 0))

    assert mapper.get_hanabi_card_index(0) == 3
    assert mapper.get_hanabi_card_index(1) == 0
    assert mapper.get_hanabi_card_index(4) == 4


def test_flipping():
    mapper: ICardMapper = CardMapper(5)

    mapper.move_a_card(MapperRequest(0, 0))
    mapper.handle_dispose(4)
    assert mapper.get_hanabi_card_index(0) == 0
    assert mapper.get_hanabi_card_index(1) == 4


def test_correct_mapping_after_disposing():
    mapper: ICardMapper = CardMapper(5)

    mapper.handle_dispose(4)

    assert mapper.get_hanabi_card_index(4) == 3
    assert mapper.get_hanabi_card_index(0) == 4

    mapper.handle_dispose(1)

    assert mapper.get_hanabi_card_index(0) == 0
    assert mapper.get_hanabi_card_index(1) == 4
    assert mapper.get_hanabi_card_index(4) == 3


def test_move_only_to_pinned_section():
    mapper: ICardMapper = CardMapper(5)

    mapper.move_a_card(MapperRequest(4, 0))
    assert mapper.move_a_card(MapperRequest(4, 2)) is False
    assert mapper.move_a_card(MapperRequest(4, 1))


def test_correct_mapping_after_moving_and_disposing():
    mapper: ICardMapper = CardMapper(5)

    mapper.move_a_card(MapperRequest(4, 0))

    assert mapper.get_hanabi_card_index(4) == 3
    assert mapper.get_hanabi_card_index(0) == 4

    mapper.handle_dispose(2)

    assert mapper.get_hanabi_card_index(2) == 0
    assert mapper.get_hanabi_card_index(1) == 1
    assert mapper.get_hanabi_card_index(0) == 4
    assert mapper.get_hanabi_card_index(4) == 3

    mapper.move_a_card(MapperRequest(4, 1))

    assert mapper.get_hanabi_card_index(0) == 4
    assert mapper.get_hanabi_card_index(1) == 3
    assert mapper.get_hanabi_card_index(2) == 1
    assert mapper.get_hanabi_card_index(3) == 0
    assert mapper.get_hanabi_card_index(4) == 2

    mapper.move_a_card(MapperRequest(1, 0))

    assert mapper.get_hanabi_card_index(0) == 3
    assert mapper.get_hanabi_card_index(1) == 4
    assert mapper.get_hanabi_card_index(2) == 1
    assert mapper.get_hanabi_card_index(3) == 0
    assert mapper.get_hanabi_card_index(4) == 2

    mapper.handle_dispose(0)

    assert mapper.get_hanabi_card_index(0) == 4
    assert mapper.get_hanabi_card_index(1) == 3
    assert mapper.get_hanabi_card_index(2) == 1
    assert mapper.get_hanabi_card_index(3) == 0
    assert mapper.get_hanabi_card_index(4) == 2


def test_undo():
    mapper: ICardMapper = CardMapper(5)
    mapper.move_a_card(MapperRequest(4, 0))

    assert mapper.get_hanabi_card_index(4) == 3

    assert mapper.undo()
    assert mapper.get_hanabi_card_index(4) == 4


def test_undo_only_until_dispose():
    mapper: ICardMapper = CardMapper(5)
    mapper.move_a_card(MapperRequest(4, 0))

    assert mapper.get_hanabi_card_index(4) == 3
    assert mapper.handle_dispose(fe_card_index=4)

    assert not mapper.undo()
    assert mapper.get_hanabi_card_index(4) == 2


def test_undo_stack():
    mapper: ICardMapper = CardMapper(5)
    mapper.move_a_card(MapperRequest(4, 0))
    mapper.move_a_card(MapperRequest(4, 1))

    assert mapper.get_hanabi_card_index(4) == 2

    assert mapper.undo()
    assert mapper.get_hanabi_card_index(4) == 3

    assert mapper.undo()
    assert mapper.get_hanabi_card_index(4) == 4


def test_remove_no_replacement():
    mapper: ICardMapper = CardMapper(4)
    mapper.move_a_card(MapperRequest(3, 0))

    mapper.handle_dispose(fe_card_index=3, with_replacement=False)

    assert mapper.get_hanabi_card_index(0) == 2
    assert mapper.get_hanabi_card_index(1) == 0
    assert mapper.get_hanabi_card_index(2) == 1


def test_moving_hot_seat_to_pinned():
    game_repository = HanabiGamesRepository()
    yuval_id = game_repository.register_player(display_name="Yuval", clothes_color_number=9)
    ethan_id = game_repository.register_player(display_name="Ethan", clothes_color_number=2)

    game_id = game_repository.create_game(game_factory=deck_to_game_factory(
        deck=HanabiDeck(cards=get_all_cards_list())))
    game_repository.assign_player_to_game(player_id=yuval_id, game_id=game_id)
    game_repository.assign_player_to_game(player_id=ethan_id, game_id=game_id)

    game_repository.start_game(game_id=game_id)

    assert game_repository.perform_action(action=GameAction(
        acting_player=yuval_id,
        action_type="inform",
        informed_player=ethan_id,
        information_data=5,
        placed_card_index=None,
        burn_card_index=None,
    ))

    game_state = game_repository.get_game_state(game_id=game_id)
    assert game_state.active_player == ethan_id and game_state.blue_token_amount == 7

    game_repository.perform_card_motion(card_motion_request=MoveCardRequest(
        player_id=ethan_id,
        initial_card_index=4,
        final_card_index=0
    ))

    game_state = game_repository.get_game_state(game_id=game_id)
    assert game_state.hands_state[1].cards[0].number.value == 5
