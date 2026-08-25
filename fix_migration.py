import re

with open("backend/alembic/versions/da66f1e44a55_initial_schema.py", "r") as f:
    content = f.read()

# We need to extract all create_table calls and wrap them.
# First, let's explicitly create the Enums at the top of upgrade().
upgrade_start = content.find("def upgrade() -> None:")
upgrade_end = content.find("def downgrade() -> None:")

upgrade_body = content[upgrade_start:upgrade_end]

new_upgrade_body = """def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    userrole_enum = sa.Enum('CITIZEN', 'OFFICER', 'ADMIN', name='userrole')
    userrole_enum.create(conn, checkfirst=True)

    priority_enum = sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='priority')
    priority_enum.create(conn, checkfirst=True)

    complaintstatus_enum = sa.Enum('SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', name='complaintstatus')
    complaintstatus_enum.create(conn, checkfirst=True)
"""

# Now parse the tables out of upgrade_body
# We can use regex to find op.create_table blocks and their corresponding create_index blocks.
# Actually, since it's just a few tables, we can just split by "op.create_table" and reconstruct it.
tables_blocks = upgrade_body.split("op.create_table('")
for block in tables_blocks[1:]:
    table_name = block.split("'", 1)[0]
    
    # Replace the inline Enums with the created enum instances so SQLAlchemy doesn't try to recreate them
    block = block.replace("sa.Enum('CITIZEN', 'OFFICER', 'ADMIN', name='userrole')", "userrole_enum")
    block = block.replace("sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='priority')", "priority_enum")
    block = block.replace("sa.Enum('SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', name='complaintstatus')", "complaintstatus_enum")
    
    new_upgrade_body += f"\n    if '{table_name}' not in tables:\n        op.create_table('{block.rstrip()}"
    new_upgrade_body += "\n"

# Indent the whole op.create_table and op.create_index blocks inside the if statements
# Wait, the string replacing logic above is too fragile with indents. Let's just do it cleanly.

