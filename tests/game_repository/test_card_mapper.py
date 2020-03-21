from games_repository.card_mapper import CardMapper
from games_repository.card_mapper_api import ICardMapper


def test_correct_mapping_after_moving():
    mapper: ICardMapper = CardMapper(5)

    mapper.move_a_card(3, 0)

    assert mapper.get_hanabi_card_index(0) == 3
    assert mapper.get_hanabi_card_index(1) == 0
    assert mapper.get_hanabi_card_index(4) == 4


def test_correct_mapping_after_disposing():
    mapper: ICardMapper = CardMapper(5)

    mapper.handle_dispose(4)

    assert mapper.get_hanabi_card_index(4) == 3
    assert mapper.get_hanabi_card_index(0) == 4

    mapper.handle_dispose(1)

    assert mapper.get_hanabi_card_index(0) == 0
    assert mapper.get_hanabi_card_index(1) == 4
    assert mapper.get_hanabi_card_index(4) == 3


def test_correct_mapping_after_moving_and_disposing():
    mapper: ICardMapper = CardMapper(5)

    mapper.move_a_card(4, 0)

    assert mapper.get_hanabi_card_index(4) == 3
    assert mapper.get_hanabi_card_index(0) == 4

    mapper.handle_dispose(2)

    assert mapper.get_hanabi_card_index(2) == 0
    assert mapper.get_hanabi_card_index(1) == 1
    assert mapper.get_hanabi_card_index(0) == 4
    assert mapper.get_hanabi_card_index(4) == 3

    mapper.move_a_card(4, 1)

    assert mapper.get_hanabi_card_index(0) == 4
    assert mapper.get_hanabi_card_index(1) == 3
    assert mapper.get_hanabi_card_index(2) == 1
    assert mapper.get_hanabi_card_index(3) == 0
    assert mapper.get_hanabi_card_index(4) == 2

    mapper.move_a_card(1, 0)

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
