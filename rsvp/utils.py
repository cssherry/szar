import string
import random
from datetime import datetime

def create_random_string(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.SystemRandom().choice(chars) for _ in range(size))

def days_between(d1, d2):
    d1 = datetime.strptime(d1, "%c")
    d2 = datetime.strptime(d2, "%c")
    return abs((d2 - d1).days)
