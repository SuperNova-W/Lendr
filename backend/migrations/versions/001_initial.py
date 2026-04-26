"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-26 00:00:00
"""

from typing import Sequence, Union

from alembic import op
import geoalchemy2
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("google_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("photo_url", sa.String(), nullable=True),
        sa.Column("radius_miles", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column(
            "location",
            geoalchemy2.Geography(geometry_type="POINT", srid=4326, spatial_index=False),
            nullable=True,
        ),
        sa.Column("rating", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("total_lends", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("google_id"),
    )
    op.create_index("ix_users_google_id", "users", ["google_id"], unique=False)
    op.create_index("idx_users_location", "users", ["location"], postgresql_using="gist")

    op.create_table(
        "items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False, server_default="misc"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("photo_url", sa.String(), nullable=True),
        sa.Column("available", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("max_days", sa.Integer(), nullable=False, server_default="7"),
        sa.Column(
            "location",
            geoalchemy2.Geography(geometry_type="POINT", srid=4326, spatial_index=False),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_items_owner_id", "items", ["owner_id"], unique=False)
    op.create_index("idx_items_location", "items", ["location"], postgresql_using="gist")

    op.create_table(
        "requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("borrower_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["item_id"], ["items.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["borrower_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_requests_item_id", "requests", ["item_id"], unique=False)
    op.create_index("ix_requests_borrower_id", "requests", ["borrower_id"], unique=False)
    op.create_index("ix_requests_owner_id", "requests", ["owner_id"], unique=False)

    op.create_table(
        "ratings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("request_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("rater_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("rated_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("positive", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["request_id"], ["requests.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["rater_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["rated_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_ratings_request_id", "ratings", ["request_id"], unique=False)
    op.create_index("ix_ratings_rater_id", "ratings", ["rater_id"], unique=False)
    op.create_index("ix_ratings_rated_id", "ratings", ["rated_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_ratings_rated_id", table_name="ratings")
    op.drop_index("ix_ratings_rater_id", table_name="ratings")
    op.drop_index("ix_ratings_request_id", table_name="ratings")
    op.drop_table("ratings")

    op.drop_index("ix_requests_owner_id", table_name="requests")
    op.drop_index("ix_requests_borrower_id", table_name="requests")
    op.drop_index("ix_requests_item_id", table_name="requests")
    op.drop_table("requests")

    op.drop_index("idx_items_location", table_name="items")
    op.drop_index("ix_items_owner_id", table_name="items")
    op.drop_table("items")

    op.drop_index("idx_users_location", table_name="users")
    op.drop_index("ix_users_google_id", table_name="users")
    op.drop_table("users")
