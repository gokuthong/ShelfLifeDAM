"""Unit tests for the post-training optimisation helpers."""

import numpy as np
import pandas as pd
import pytest

from src.optimisation import (
    best_threshold,
    calibration_table,
    feature_importance,
    measure_runtime,
    threshold_sweep,
)


@pytest.fixture
def scored_holdout() -> tuple[np.ndarray, np.ndarray]:
    """A toy hold-out where high scores really are the positives."""
    rng = np.random.default_rng(42)
    y = (rng.random(400) < 0.2).astype(int)
    # informative but noisy scores
    proba = np.clip(0.55 * y + 0.3 * rng.random(400), 0, 1)
    return y, proba


def test_threshold_sweep_has_expected_columns(scored_holdout) -> None:
    y, proba = scored_holdout
    sweep = threshold_sweep(y, proba)
    assert set(sweep.columns) == {"threshold", "precision", "recall", "f1"}
    assert len(sweep) > 50


def test_threshold_sweep_recall_decreases_with_threshold(scored_holdout) -> None:
    y, proba = scored_holdout
    sweep = threshold_sweep(y, proba)
    recalls = sweep.sort_values("threshold")["recall"].to_numpy()
    assert (np.diff(recalls) <= 1e-9).all()


def test_best_threshold_maximises_f1(scored_holdout) -> None:
    y, proba = scored_holdout
    sweep = threshold_sweep(y, proba)
    best = best_threshold(sweep)
    assert best["f1"] == pytest.approx(sweep["f1"].max())


def test_calibration_table_returns_brier_in_unit_interval(scored_holdout) -> None:
    y, proba = scored_holdout
    table, brier = calibration_table(y, proba, n_bins=5)
    assert 0.0 <= brier <= 1.0
    assert {"mean_predicted", "fraction_positive"} <= set(table.columns)


def _toy_pipeline_and_data():
    from sklearn.linear_model import LogisticRegression

    from src.preprocessing import build_pipeline

    X = pd.DataFrame(
        {
            "num_a": np.linspace(0, 1, 120),
            "num_b": np.linspace(1, 0, 120),
            "cat_a": ["x", "y"] * 60,
        }
    )
    y = pd.Series(([0] * 9 + [1]) * 12)
    pipe = build_pipeline(LogisticRegression(max_iter=200))
    return pipe, X, y


def test_measure_runtime_reports_positive_times() -> None:
    pipe, X, y = _toy_pipeline_and_data()
    result = measure_runtime(pipe, X, y, X)
    assert result["fit_seconds"] > 0
    assert result["predict_seconds"] > 0
    assert result["n_train"] == len(X)


def test_feature_importance_uses_coefficients_for_linear_model() -> None:
    pipe, X, y = _toy_pipeline_and_data()
    pipe.fit(X, y)
    table = feature_importance("Logistic Regression", pipe, top_n=3)
    assert len(table) == 3
    assert (table["importance"] >= 0).all()
    assert table["importance_type"].iloc[0] == "abs_coefficient"
