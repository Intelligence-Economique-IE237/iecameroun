"""roles utilisateurs

Revision ID: abf100a88759
Revises: b723ca8e1343
Create Date: 2026-11-03 13:46:03.644714

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel  # noqa: F401


# revision identifiers, used by Alembic.
revision: str = 'abf100a88759'
down_revision: Union[str, Sequence[str], None] = 'b723ca8e1343'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Écrite à la main : l'autogénération aurait supprimé la table "admin" puis créé
# "utilisateur", en perdant les comptes existants. Ici on renomme et on garde les données.


def upgrade() -> None:
    """Upgrade schema."""
    op.rename_table("admin", "utilisateur")
    op.execute("ALTER INDEX ix_admin_email RENAME TO ix_utilisateur_email")
    op.execute("ALTER TABLE utilisateur RENAME CONSTRAINT admin_pkey TO utilisateur_pkey")
    op.execute("ALTER SEQUENCE admin_id_seq RENAME TO utilisateur_id_seq")
    # Les comptes déjà créés étaient tous des admins : ils gardent ce rôle
    op.add_column(
        "utilisateur",
        sa.Column("role", sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False, server_default="admin"),
    )
    # La valeur par défaut des nouveaux comptes est gérée par l'application
    op.alter_column("utilisateur", "role", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("utilisateur", "role")
    op.execute("ALTER SEQUENCE utilisateur_id_seq RENAME TO admin_id_seq")
    op.execute("ALTER TABLE utilisateur RENAME CONSTRAINT utilisateur_pkey TO admin_pkey")
    op.execute("ALTER INDEX ix_utilisateur_email RENAME TO ix_admin_email")
    op.rename_table("utilisateur", "admin")
