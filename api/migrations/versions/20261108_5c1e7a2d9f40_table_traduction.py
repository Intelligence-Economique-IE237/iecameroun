"""table traduction

Cache des traductions automatiques (site et panneau admin) : un texte source
n'est envoyé qu'une seule fois au service de traduction pour chaque langue.

Revision ID: 5c1e7a2d9f40
Revises: 0938ca8aea5a
Create Date: 2026-11-08 15:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel  # noqa: F401


# revision identifiers, used by Alembic.
revision: str = '5c1e7a2d9f40'
down_revision: Union[str, Sequence[str], None] = '0938ca8aea5a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('traduction',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('langue', sqlmodel.sql.sqltypes.AutoString(length=10), nullable=False),
    sa.Column('empreinte', sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
    sa.Column('source', sa.Text(), nullable=False),
    sa.Column('texte', sa.Text(), nullable=False),
    sa.Column('cree_le', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('langue', 'empreinte', name='uq_traduction_langue_empreinte')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('traduction')
