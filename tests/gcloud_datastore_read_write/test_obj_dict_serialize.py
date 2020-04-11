import random
from gcloud_datastore.gcloud_datastore_read_write import obj_to_dict, dict_to_obj


OBJ_LEN = 10000


def test_obj_to_dict_to_obj():
    max_length = 1000
    obj = random.getrandbits(OBJ_LEN * 8)

    dct = obj_to_dict(obj=obj, max_length=max_length)
    assert all(len(v) <= max_length for v in dct.values())
    assert all(isinstance(k, str) for k in dct.keys())
    assert all(isinstance(v, bytes) for v in dct.values())

    obj_copy = dict_to_obj(dct)
    assert obj_copy == obj
