import math
import pickle
from typing import Optional, Dict, Any

from google.cloud import datastore

from games_repository.game_repository import HanabiGamesRepository
from games_repository.games_repository_api import IGamesRepository

DB_KIND = 'Repository'
DB_NAME = "hanabi_repository_1"
try:
    datastore_client = datastore.Client()
except Exception as e:
    print("Couldn't connect to datastore!")


def obj_to_dict(obj: Any, max_length: int = 1500) -> Dict[str, bytes]:
    bts = pickle.dumps(obj)
    return {str(i): bts[i * max_length: (i + 1) * max_length]
            for i in range(math.ceil(len(bts) / max_length))}


def dict_to_obj(dct: Dict[str, bytes]) -> Any:
    bts_array = bytearray(sum(len(v) for v in dct.values()))
    counter = 0
    for v in map(lambda t: t[1], sorted(dct.items(), key=lambda t: int(t[0]))):
        bts_array[counter: counter + len(v)] = v
        counter += len(v)

    obj = None
    try:
        obj = pickle.loads(bts_array)
    except Exception as pkl_error:
        print(f"Couldn't unpickle data from storage ({pkl_error}). Try reinitializing repository")
    return obj


def _read_game_repository() -> Optional[IGamesRepository]:
    query = datastore_client.query(kind=DB_KIND)
    for entity in query.fetch():
        try:
            if entity.key.name == DB_NAME:
                return dict_to_obj(entity)
        except Exception:
            print("Couldn't load some entries")

    return None


def get_game_repository() -> IGamesRepository:
    try:
        print("Loading game repository from datastore...")
        repository = _read_game_repository()
        if repository is None:
            exit(1)
            repository: IGamesRepository = HanabiGamesRepository()
            save_game_repository_state(repository)

        print(f"Repository active games: {repository.get_active_games()}")
    except Exception as e:
        print(f"Couldn't load repository from db. Using dev repo instead ({e})")
        repository: IGamesRepository = HanabiGamesRepository()
    return repository


def save_game_repository_state(repository: IGamesRepository) -> bool:
    try:
        print("Saving game repository to datastore...")
        repo_key = datastore_client.key(DB_KIND, DB_NAME)

        # Prepares the new entity
        repo_entity = datastore.Entity(key=repo_key)
        repo_entity.update(obj_to_dict(repository))

        # Saves the entity
        datastore_client.put(repo_entity)

        print("Saved to DB")
        return True
    except Exception as e_saving:
        print(f"Unable to save to DB: {str(e_saving)}")
        return False


if __name__ == '__main__':
    # script for reseting db
    new_repository: IGamesRepository = HanabiGamesRepository()
    # save_game_repository_state(new_repository)
    repository = get_game_repository()
    print(1)
