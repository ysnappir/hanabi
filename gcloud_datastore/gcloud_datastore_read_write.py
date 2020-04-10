import pickle
from typing import Optional

from google.cloud import datastore

from games_repository.game_repository import HanabiGamesRepository
from games_repository.games_repository_api import IGamesRepository

DB_KIND = 'Repository'
DB_NAME = "hanabi_repository"
try:
    datastore_client = datastore.Client()
except Exception as e:
    print("Couldn't connect to datastore!")


def _read_game_repository() -> Optional[IGamesRepository]:
    query = datastore_client.query(kind=DB_KIND)
    for entity in query.fetch():
        try:
            return pickle.loads(entity['pkl_bytes'])
        except Exception:
            print("Couldn't load some entries")

    return None


def get_game_repository() -> IGamesRepository:
    try:
        print("Loading game repository from datastore...")
        repository = _read_game_repository()
        if repository is None:
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
        repo_entity['pkl_bytes'] = pickle.dumps(repository)

        # Saves the entity
        datastore_client.put(repo_entity)
        return True
    except Exception:
        return False
