from .context import router as context_router
from .copilot import router as copilot_router
from .dashboard import router as dashboard_router
from .operations import router as operations_router
from .users import router as users_router
from .farms import router as farms_router

__all__ = [
    "context_router",
    "dashboard_router",
    "operations_router",
    "copilot_router",
    "users_router",
    "farms_router",
]
