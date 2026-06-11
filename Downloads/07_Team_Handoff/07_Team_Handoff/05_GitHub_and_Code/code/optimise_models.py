"""Run the post-training optimisation pass over the saved models.

Reuses the pipelines saved by ``run_pipeline.py`` (same stratified split via
``random_state=42``), so nothing is retrained for the threshold/calibration/
importance analysis; only the runtime measurement refits one clone per model.

Outputs:
    reports/threshold_metrics.csv          default-0.5 vs F1-tuned metrics
    reports/complexity_timings.csv         measured times + asymptotic costs
    reports/figures/threshold_sweep.png    P/R/F1 vs threshold, all models
    reports/figures/calibration_curves.png reliability curves + Brier scores
    reports/figures/feature_importance.png top-15 per model
    outputs/tables/feature_importance.csv  the same importances as data

Usage (from ``05_GitHub_and_Code/code/``):
    python optimise_models.py
"""

from __future__ import annotations

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

from src.data_loader import load_home_credit
from src.optimisation import (
    PREDICT_COMPLEXITY,
    TRAIN_COMPLEXITY,
    best_threshold,
    calibration_table,
    feature_importance,
    load_saved_pipelines,
    measure_runtime,
    threshold_sweep,
)
from src.preprocessing import build_features, stratified_split
from src.utils import FIGURES_DIR, PROJECT_ROOT, ensure_dir, get_logger, timed

log = get_logger("optimise_models")

MODEL_COLOURS = {
    "Logistic Regression": "#4C72B0",
    "Random Forest": "#55A868",
    "XGBoost": "#C44E52",
}


def main() -> None:
    df = load_home_credit()
    X, y = build_features(df)
    split = stratified_split(X, y, random_state=42)
    models = load_saved_pipelines()
    if not models:
        raise SystemExit("No saved models found - run `python run_pipeline.py` first.")

    reports_dir = ensure_dir(FIGURES_DIR.parent)
    figures_dir = ensure_dir(FIGURES_DIR)
    tables_dir = ensure_dir(PROJECT_ROOT / "outputs" / "tables")

    # ---------------------------------------------------------------- thresholds
    threshold_rows = []
    sweep_fig, sweep_axes = plt.subplots(1, len(models), figsize=(5.4 * len(models), 4.4))
    if len(models) == 1:
        sweep_axes = [sweep_axes]

    proba_cache = {}
    for ax, (name, pipe) in zip(sweep_axes, models.items()):
        with timed(f"scoring hold-out with {name}", log):
            proba = pipe.predict_proba(split.X_test)[:, 1]
        proba_cache[name] = proba

        sweep = threshold_sweep(split.y_test.to_numpy(), proba)
        base = sweep.loc[(sweep["threshold"] - 0.5).abs().idxmin()]
        best = best_threshold(sweep)
        threshold_rows.append(
            {
                "model": name,
                "f1_at_0.5": float(base["f1"]),
                "precision_at_0.5": float(base["precision"]),
                "recall_at_0.5": float(base["recall"]),
                "best_threshold": best["threshold"],
                "f1_tuned": best["f1"],
                "precision_tuned": best["precision"],
                "recall_tuned": best["recall"],
            }
        )

        for metric, style in [("precision", "--"), ("recall", ":"), ("f1", "-")]:
            ax.plot(sweep["threshold"], sweep[metric], style,
                    color=MODEL_COLOURS[name], label=metric, linewidth=2)
        ax.axvline(best["threshold"], color="grey", linestyle="-.", linewidth=1.2,
                   label=f"best t={best['threshold']:.2f}")
        ax.axvline(0.5, color="black", linestyle="-", linewidth=0.8, alpha=0.4)
        ax.set_title(name)
        ax.set_xlabel("Decision threshold")
        ax.set_ylabel("Score")
        ax.set_ylim(0, 1)
        ax.grid(alpha=0.35)
        ax.legend(loc="upper right", fontsize=8)

    sweep_fig.suptitle("Decision-threshold sweep on the stratified hold-out", fontweight="bold")
    sweep_fig.tight_layout()
    sweep_fig.savefig(figures_dir / "threshold_sweep.png", dpi=140, bbox_inches="tight")
    plt.close(sweep_fig)

    threshold_df = pd.DataFrame(threshold_rows)
    threshold_df.to_csv(reports_dir / "threshold_metrics.csv", index=False)
    log.info("threshold metrics:\n%s", threshold_df.to_string(index=False))

    # ---------------------------------------------------------------- calibration
    cal_fig, cal_ax = plt.subplots(figsize=(6.2, 5.4))
    brier_rows = []
    for name, proba in proba_cache.items():
        table, brier = calibration_table(split.y_test.to_numpy(), proba)
        brier_rows.append({"model": name, "brier_score": brier})
        cal_ax.plot(table["mean_predicted"], table["fraction_positive"], "o-",
                    color=MODEL_COLOURS[name], label=f"{name} (Brier={brier:.3f})")
    cal_ax.plot([0, 1], [0, 1], "k--", linewidth=1, label="Perfectly calibrated")
    cal_ax.set_xlabel("Mean predicted default probability")
    cal_ax.set_ylabel("Observed default fraction")
    cal_ax.set_title("Calibration (reliability) curves - hold-out set", fontweight="bold")
    cal_ax.grid(alpha=0.35)
    cal_ax.legend(loc="upper left", fontsize=9)
    cal_fig.tight_layout()
    cal_fig.savefig(figures_dir / "calibration_curves.png", dpi=140, bbox_inches="tight")
    plt.close(cal_fig)

    # ---------------------------------------------------------------- runtimes
    runtime_rows = []
    for name, pipe in models.items():
        with timed(f"measuring fit/predict runtime for {name}", log):
            r = measure_runtime(pipe, split.X_train, split.y_train, split.X_test)
        runtime_rows.append(
            {
                "model": name,
                "fit_seconds": round(r["fit_seconds"], 2),
                "predict_seconds": round(r["predict_seconds"], 2),
                "n_train": r["n_train"],
                "n_test": r["n_test"],
                "train_complexity": TRAIN_COMPLEXITY[name],
                "predict_complexity": PREDICT_COMPLEXITY[name],
            }
        )
    runtime_df = pd.DataFrame(runtime_rows).merge(pd.DataFrame(brier_rows), on="model")
    runtime_df.to_csv(reports_dir / "complexity_timings.csv", index=False)
    log.info("complexity/timings:\n%s", runtime_df.to_string(index=False))

    # ---------------------------------------------------------------- importance
    imp_tables = [feature_importance(name, pipe) for name, pipe in models.items()]
    imp_df = pd.concat(imp_tables, ignore_index=True)
    imp_df.to_csv(tables_dir / "feature_importance.csv", index=False)

    imp_fig, imp_axes = plt.subplots(1, len(models), figsize=(6.0 * len(models), 5.6))
    if len(models) == 1:
        imp_axes = [imp_axes]
    for ax, table in zip(imp_axes, imp_tables):
        name = table["model"].iloc[0]
        plot_t = table.iloc[::-1]
        ax.barh(plot_t["feature"], plot_t["importance"], color=MODEL_COLOURS[name])
        ax.set_title(f"{name}\n({table['importance_type'].iloc[0]})")
        ax.tick_params(axis="y", labelsize=8)
        ax.grid(axis="x", alpha=0.35)
    imp_fig.suptitle("Top-15 global feature importances per model", fontweight="bold")
    imp_fig.tight_layout()
    imp_fig.savefig(figures_dir / "feature_importance.png", dpi=140, bbox_inches="tight")
    plt.close(imp_fig)

    print("\n===== THRESHOLD TUNING (hold-out) =====")
    print(threshold_df.to_string(index=False))
    print("\n===== COMPLEXITY / TIMINGS =====")
    print(runtime_df.to_string(index=False))


if __name__ == "__main__":
    main()
