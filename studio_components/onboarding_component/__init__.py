"""Cinematic typewriter onboarding as a bi-directional Streamlit component."""
from __future__ import annotations

import os
from typing import Any

import streamlit.components.v1 as _components

_COMPONENT_DIR = os.path.dirname(os.path.abspath(__file__))
_onboarding_component = _components.declare_component(
    "onboarding_sequence", path=_COMPONENT_DIR
)


def onboarding_sequence(
    *,
    questions: list[dict[str, str]],
    logo_url: str = "",
    key: str | None = None,
) -> dict | None:
    """Render the typewriter onboarding and return answers when complete."""
    return _onboarding_component(
        questions=questions,
        logo_url=logo_url,
        key=key,
        default=None,
    )
