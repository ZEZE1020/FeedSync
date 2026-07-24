from .context import router as context_router
from .copilot import router as copilot_router
from .dashboard import router as dashboard_router
from .operations import router as operations_router

__all__ = ["context_router", "dashboard_router", "operations_router", "copilot_router"]
