"""repair_users_phone_fields

Revision ID: 027638a64541
Revises: d0314047235b
Create Date: 2026-08-24 19:34:21.333185

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '027638a64541'
down_revision: Union[str, None] = 'd0314047235b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'phone_number' not in columns:
        op.add_column('users', sa.Column('phone_number', sa.String(), nullable=True))
        op.create_index(op.f('ix_users_phone_number'), 'users', ['phone_number'], unique=True)
        
    if 'is_phone_verified' not in columns:
        op.add_column('users', sa.Column('is_phone_verified', sa.Boolean(), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'is_phone_verified' in columns:
        op.drop_column('users', 'is_phone_verified')
    if 'phone_number' in columns:
        op.drop_index(op.f('ix_users_phone_number'), table_name='users')
        op.drop_column('users', 'phone_number')
