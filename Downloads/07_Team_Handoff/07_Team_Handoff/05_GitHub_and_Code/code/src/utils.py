"""Small helpers used across the project: logging and timing."""

from __future__ import annotations

import logging
import time
from contextlib import contextmanager
from pathlib import Path

_LOGGER_CONFIGURED = False


def get_logger(name: str = "homecredit") -> logging.Logger:
    """Return a module-level logger with a one-time formatted handler.

    Using a single helper keeps every module's log lines visually consistent,
    which makes it easier to scan terminal output during long runs.
    """
    global _LOGGER_CONFIGURED
    if not _LOGGER_CONFIGURED:
        # Configure the *root* logger once so that every module logger (src.eda,
        # src.evaluation, src.models.*, ...) propagates to the same handler. Attaching
        # the handler to only the first named logger would silently drop the INFO logs
        # of every other module, including the metrics and classification report.
        handler = logging.StreamHandler()
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
        root = logging.getLogger()
        root.addHandler(handler)
        root.setLevel(logging.INFO)
        _LOGGER_CONFIGURED = True
    return logging.getLogger(name)


@contextmanager
def timed(message: str, logger: logging.Logger | None = None):
    """Context manager that logs how long a block of code took.

    Example
    -------
    >>> with timed("loading dataframe"):
    ...     df = pd.read_csv(...)
    """
    log = logger or get_logger()
    start = time.perf_counter()
    log.info("%s: started", message)
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        log.info("%s: done in %.2fs", message, elapsed)


def ensure_dir(path: str | Path) -> Path:
    """Create the directory if it does not exist and return it as a Path."""
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
FIGURES_DIR = PROJECT_ROOT / "reports" / "figures"
MODELS_DIR = PROJECT_ROOT / "models_store"
