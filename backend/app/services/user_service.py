from app.database.models import User
from app.auth.security import hash_password,verify_password

def create_user(
    db,
    data
):

    user = User(

        name=data.name,

        email=data.email,

        password=hash_password(
            data.password
        )
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return user

def get_user_by_email(
    db,
    email
):
    return (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

def get_user_by_id(
    db,
    user_id
):

    return (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

def update_user(
    db,
    user_id,
    data
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    user.name = data.name

    db.commit()

    db.refresh(user)

    return user


def get_target_goal(
    db,
    user_id
):

    return (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )


def update_target_goal(
    db,
    user_id,
    target_weight_kg
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    user.target_weight_kg = target_weight_kg

    db.commit()

    db.refresh(user)

    return user


# New function to change user password
def change_password(

    db,

    user_id,

    old_password,

    new_password
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not verify_password(
        old_password,
        user.password
    ):
        return False

    user.password = hash_password(
        new_password
    )

    db.commit()

    return True