"""Post-training optimisation and complexity analysis.

The three model scripts train at the default 0.5 decision threshold, which is
rarely optimal when only ~8% of applicants default. This module adds the
"measure and optimise" evidence the project needs:

1. ``threshold_sweep``    - precision/recall/F1 across thresholds on the
                            hold-out set, plus the F1-maximising threshold.
2. ``calibration_table``  - reliability curve points and the Brier score, to
                            show how the imbalance corrections inflate the raw
                            scores (good ranking, not calibrated probabilities).
3. ``measure_runtime``    - wall-clock fit/predict times on the full pipeline,
                            reported next to each model's asymptotic cost.
4. ``feature_importance`` - the model's own global importance: absolute
                            coefficients for Logistic Regression, impurity
                            importances for Random Forest, gain for XGBoost.

Asymptotic training costs (n samples, d features after encoding, T trees,
L max leaves/depth):

* Logistic Regression (liblinear): O(n * d) per coordinate-descent epoch.
* Random Forest: O(T * n * log(n) * sqrt(d)) - each of T trees sorts bootstrap
  samples over sqrt(d) candidate features per split.
* XGBoost (hist): O(T * L * n) after the one-off O(n * d) histogram build -
  the histogram trick replaces per-split sorting with binned scans.

Prediction is O(d) per row for LR and O(T * depth) per row for the ensembles,
which is why all three models score the 61,503-row hold-out in seconds.
"""

from __future__ import annotations

import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import calibration_curve
from sklearn.metrics import brier_score_loss, f1_score, precision_score, recall_score

from src.utils import MODELS_DIR, get_logger

log = get_logger(__name__)

MODEL_FILES = {
    "Logistic Regression": "logistic_regression.joblib",
    "Random Forest": "random_forest.joblib",
    "XGBoost": "xgboost.joblib",
}

# Documented asymptotic costs, kept next to the measured timings so the report
# can quote both from one table.
TRAIN_COMPLEXITY = {
    "Logistic Regression": "O(n*d) per epoch (liblinear coordinate descent)",
    "Random Forest": "O(T*n*log n*sqrt(d)), T=200 trees, depth<=20",
    "XGBoost": "O(T*L*n) with hist binning, T=400 trees, depth<=6",
}
PREDICT_COMPLEXITY = {
    "Logistic Regression": "O(d) per row",
    "Random Forest": "O(T*depth) per row",
    "XGBoost": "O(T*depth) per row",
}


def load_saved_pipelines() -> dict:
    """Load every trained pipeline present in ``models_store/``."""
    out = {}
    for name, fname in MODEL_FILES.items():
        path = MODELS_DIR / fname
        if path.exists():
            out[name] = joblib.load(path)
        else:
            log.warning("model file missing, skipping %s (%s)", name, path)
    return out


def threshold_sweep(
    y_true: np.ndarray,
    y_proba: np.ndarray,
    thresholds: np.ndarray | None = None,
) -> pd.DataFrame:
    """Precision/recall/F1 at each candidate decision threshold."""
    if thresholds is None:
        thresholds = np.round(np.arange(0.05, 0.96, 0.01), 2)
    rows = []
    for t in thresholds:
        pred = (y_proba >= t).astype(int)
        rows.append(
            {
                "threshold": float(t),
                "precision": precision_score(y_true, pred, zero_division=0),
                "recall": recall_score(y_true, pred, zero_division=0),
                "f1": f1_score(y_true, pred, zero_division=0),
            }
        )
    return pd.DataFrame(rows)


def best_threshold(sweep: pd.DataFrame) -> dict:
    """The F1-maximising row of a ``threshold_sweep`` table as a dict."""
    row = sweep.loc[sweep["f1"].idxmax()]
    return {
        "threshold": float(row["threshold"]),
        "precision": float(row["precision"]),
        "recall": float(row["recall"]),
        "f1": float(row["f1"]),
    }


def calibration_table(
    y_true: np.ndarray, y_proba: np.ndarray, n_bins: int = 10
) -> tuple[pd.DataFrame, float]:
    """Reliability-curve points plus the Brier score.

    A perfectly calibrated model has points on the diagonal and a low Brier
    score. The imbalance-corrected models score high on ranking (ROC-AUC) but
    sit above the diagonal: their raw scores overstate the true default rate,
    which is why the dashboard reports percentile risk bands instead of raw
    probabilities.
    """
    frac_pos, mean_pred = calibration_curve(
        y_true, y_proba, n_bins=n_bins, strategy="quantile"
    )
    table = pd.DataFrame({"mean_predicted": mean_pred, "fraction_positive": frac_pos})
    return table, float(brier_score_loss(y_true, y_proba))


def measure_runtime(pipeline, X_train, y_train, X_test, n_repeats: int = 1) -> dict:
    """Wall-clock fit and predict times for a (cloned) pipeline."""
    from sklearn.base import clone

    fit_times, predict_times = [], []
    for _ in range(n_repeats):
        fresh = clone(pipeline)
        t0 = time.perf_counter()
        fresh.fit(X_train, y_train)
        fit_times.append(time.perf_counter() - t0)

        t0 = time.perf_counter()
        fresh.predict_proba(X_test)
        predict_times.append(time.perf_counter() - t0)

    return {
        "fit_seconds": float(np.mean(fit_times)),
        "predict_seconds": float(np.mean(predict_times)),
        "n_train": len(X_train),
        "n_test": len(X_test),
    }


def feature_importance(name: str, pipeline, top_n: int = 15) -> pd.DataFrame:
    """Global feature importance for one fitted pipeline.

    Uses each model's native importance so the numbers match what the model
    actually used: |coefficient| (on standardised inputs) for LR, mean impurity
    decrease for RF, total gain for XGBoost.
    """
    prep = pipeline.named_steps["prep"]
    clf = pipeline.named_steps["clf"]
    features = prep.get_feature_names_out()

    if hasattr(clf, "feature_importances_"):
        scores = clf.feature_importances_
        kind = "impurity" if name == "Random Forest" else "gain"
    else:
        scores = np.abs(clf.coef_).ravel()
        kind = "abs_coefficient"

    table = (
        pd.DataFrame({"feature": features, "importance": scores})
        .sort_values("importance", ascending=False)
        .head(top_n)
        .reset_index(drop=True)
    )
    table.insert(0, "model", name)
    table["importance_type"] = kind
    return table
